import { afterEach, describe, expect, test, vi } from "vitest";

import { HttpClient } from "../src/http";
import { JsonApiError } from "../src/jsonapi";

describe("HttpClient", () => {
  afterEach(() => {
    vi.useRealTimers();
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

  test("applies per-request timeout and merges request headers", async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    const fetchMock = vi.fn().mockImplementation(
      (_input: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          requestSignal = init?.signal ?? undefined;
          requestSignal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const http = new HttpClient({
      baseUrl: "https://api.example.org",
      timeout: 10,
      headers: {
        "X-Client": "client-default",
        "X-Shared": "client-default",
      },
    });
    const request = http.requestJson(
      "/resource",
      {
        method: "GET",
        headers: { "X-Method": "method-header" },
      },
      {
        timeout: 50,
        headers: {
          "X-Request": "request-header",
          "X-Shared": "request-override",
        },
      },
    );
    const result = request.catch((error: unknown) => error);

    await vi.advanceTimersByTimeAsync(10);
    expect(requestSignal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(40);
    await expect(result).resolves.toMatchObject({
      statusCode: 408,
      message: "Request timed out.",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.org/v0/resource",
      expect.objectContaining({
        headers: {
          Accept: "application/json",
          "X-Client": "client-default",
          "X-Shared": "request-override",
          "X-Request": "request-header",
          "X-Method": "method-header",
        },
      }),
    );
  });

  test("uses the client timeout when a request does not override it", async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    const fetchMock = vi.fn().mockImplementation(
      (_input: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          requestSignal = init?.signal ?? undefined;
          requestSignal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const http = new HttpClient({
      baseUrl: "https://api.example.org",
      timeout: 25,
    });

    const request = http
      .requestJson("/resource", { method: "GET" })
      .catch((error: unknown) => error);

    await vi.advanceTimersByTimeAsync(25);
    await expect(request).resolves.toMatchObject({
      statusCode: 408,
      message: "Request timed out.",
    });
    expect(requestSignal?.aborted).toBe(true);
  });

  test("applies request options to blob requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("contents", {
        status: 200,
        headers: { "content-type": "application/octet-stream" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const http = new HttpClient({
      baseUrl: "https://api.example.org",
      headers: { "X-Client": "client-default" },
    });

    await expect(
      http.requestBlob(
        "/nodes/uuid/repo/contents",
        { method: "GET" },
        { timeout: 1_000, headers: { "X-Request": "blob-download" } },
      ),
    ).resolves.toBeInstanceOf(Blob);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.org/v0/nodes/uuid/repo/contents",
      expect.objectContaining({
        headers: {
          Accept: "*/*",
          "X-Client": "client-default",
          "X-Request": "blob-download",
        },
      }),
    );
  });

  test.each(["json", "blob"] as const)(
    "propagates caller cancellation for %s requests",
    async (responseType) => {
      const controller = new AbortController();
      const fetchMock = vi.fn().mockImplementation(
        (_input: string, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            const signal = init?.signal;
            signal?.addEventListener(
              "abort",
              () => reject(signal.reason),
              { once: true },
            );
          }),
      );
      vi.stubGlobal("fetch", fetchMock);
      const http = new HttpClient({ baseUrl: "https://api.example.org" });
      const requestOptions = { signal: controller.signal };
      const request =
        responseType === "json"
          ? http.requestJson("/resource", { method: "GET" }, requestOptions)
          : http.requestBlob("/resource", { method: "GET" }, requestOptions);
      const result = request.catch((error: unknown) => error);

      controller.abort(new DOMException("Caller cancelled", "AbortError"));

      const error = await result;
      expect(error).toMatchObject({
        name: "AbortError",
        message: "Caller cancelled",
      });
      expect(error).not.toBeInstanceOf(JsonApiError);
    },
  );
});
