import { afterEach, describe, expect, test, vi } from "vitest";

import { JsonApiError, createAiidaRestClient } from "../src";

describe("daemon client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("requests daemon status from configured base URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ running: true, num_workers: 2 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createAiidaRestClient({
      baseUrl: "https://api.example.org",
      apiPrefix: "/v0",
    });
    const result = await client.daemon.status();

    expect(result).toEqual({ running: true, num_workers: 2 });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.org/v0/daemon/status",
      expect.objectContaining({ method: "GET" }),
    );
  });

  test("raises typed error on JSON:API failures", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          errors: [
            {
              status: "500",
              title: "DaemonException",
              detail: "The daemon is not running.",
            },
          ],
        }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const client = createAiidaRestClient({
      baseUrl: "https://api.example.org",
    });

    try {
      await client.daemon.decrease();
      throw new Error("Expected daemon decrease to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(JsonApiError);
      expect(error).toMatchObject({
        statusCode: 500,
        message: "The daemon is not running.",
      });
    }
  });
});
