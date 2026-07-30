import { afterEach, describe, expect, test, vi } from "vitest";

import { createAiidaRestClient } from "../src";

describe("createAiidaRestClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("wires daemon requests through the configured HTTP client", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          running: true,
          num_workers: 2,
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const client = createAiidaRestClient({
      baseUrl: "https://api.example.org",
      apiPrefix: "/v0",
    });

    await expect(client.daemon.status()).resolves.toEqual({
      running: true,
      num_workers: 2,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.org/v0/daemon/status",
      expect.objectContaining({
        method: "GET",
      }),
    );
  });
});
