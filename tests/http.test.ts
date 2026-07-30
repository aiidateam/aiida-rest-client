import { afterEach, describe, expect, test, vi } from "vitest";

import { HttpClient } from "../src/http";
import { JsonApiError } from "../src/jsonapi";

describe("HttpClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("constructs the request URL and parses JSON", async () => {
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

    const http = new HttpClient({
      baseUrl: "https://api.example.org",
      apiPrefix: "/v0",
    });

    const result = await http.requestJson<{
      running: boolean;
      num_workers: number;
    }>("/daemon/status", {
      method: "GET",
    });

    expect(result).toEqual({
      running: true,
      num_workers: 2,
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.org/v0/daemon/status",
      expect.objectContaining({
        method: "GET",
      }),
    );
  });

  test("throws JsonApiError for JSON:API error responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
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
            headers: {
              "content-type": "application/json",
            },
          },
        ),
      ),
    );

    const http = new HttpClient({
      baseUrl: "https://api.example.org",
      apiPrefix: "/v0",
    });

    const promise = http.requestJson("/daemon/stop", {
      method: "POST",
    });

    await expect(promise).rejects.toBeInstanceOf(JsonApiError);
    await expect(promise).rejects.toMatchObject({
      statusCode: 500,
      message: "The daemon is not running.",
    });
  });

  test("forwards request options", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const http = new HttpClient({
      baseUrl: "https://api.example.org",
      apiPrefix: "/v0",
    });

    await http.requestJson("/resource", {
      method: "POST",
      headers: {
        "x-test-header": "test-value",
      },
      body: JSON.stringify({
        value: 1,
      }),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.org/v0/resource",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          value: 1,
        }),
      }),
    );
  });
});
