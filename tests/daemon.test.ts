import { afterEach, describe, expect, test, vi } from "vitest";

import { DaemonClientImpl } from "../src/daemon";
import type {
  DaemonStatus,
  DaemonWorkersByIdentifier,
  JsonHttpClient,
} from "../src/types";

function createHttpMock() {
  return {
    requestJson: vi.fn(),
  } satisfies JsonHttpClient;
}

describe("DaemonClientImpl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test.each([
    {
      name: "status",
      invoke: (client: DaemonClientImpl) => client.status(),
      path: "/daemon/status",
      method: "GET",
      response: {
        running: true,
        num_workers: 2,
      } satisfies DaemonStatus,
    },
    {
      name: "start",
      invoke: (client: DaemonClientImpl) => client.start(),
      path: "/daemon/start",
      method: "POST",
      response: {
        running: true,
        num_workers: 1,
      } satisfies DaemonStatus,
    },
    {
      name: "stop",
      invoke: (client: DaemonClientImpl) => client.stop(),
      path: "/daemon/stop",
      method: "POST",
      response: {
        running: false,
        num_workers: null,
      } satisfies DaemonStatus,
    },
    {
      name: "restart",
      invoke: (client: DaemonClientImpl) => client.restart(),
      path: "/daemon/restart",
      method: "POST",
      response: {
        running: true,
        num_workers: 1,
      } satisfies DaemonStatus,
    },
  ])("requests daemon $name", async ({ invoke, path, method, response }) => {
    const http = createHttpMock();
    http.requestJson.mockResolvedValue(response);

    const client = new DaemonClientImpl(http);

    await expect(invoke(client)).resolves.toEqual(response);

    expect(http.requestJson).toHaveBeenCalledOnce();
    expect(http.requestJson).toHaveBeenCalledWith(path, {
      method,
    }, undefined);
  });

  test("requests daemon workers", async () => {
    const response = {
      "1234": {
        pid: 1234,
        mem: 0.7,
        cpu: 0.0,
        started: 1785410932.4201467,
      },
    } satisfies DaemonWorkersByIdentifier;

    const http = createHttpMock();
    http.requestJson.mockResolvedValue(response);

    const client = new DaemonClientImpl(http);

    await expect(client.workers()).resolves.toEqual(response);

    expect(http.requestJson).toHaveBeenCalledOnce();
    expect(http.requestJson).toHaveBeenCalledWith("/daemon/workers", {
      method: "GET",
    }, undefined);
  });

  test.each([
    {
      name: "increase",
      invoke: (client: DaemonClientImpl) => client.increase(2),
      path: "/daemon/increase?amount=2",
      response: {
        running: true,
        num_workers: 3,
      } satisfies DaemonStatus,
    },
    {
      name: "decrease",
      invoke: (client: DaemonClientImpl) => client.decrease(2),
      path: "/daemon/decrease?amount=2",
      response: {
        running: true,
        num_workers: 1,
      } satisfies DaemonStatus,
    },
  ])(
    "requests daemon $name with an explicit amount",
    async ({ invoke, path, response }) => {
      const http = createHttpMock();
      http.requestJson.mockResolvedValue(response);

      const client = new DaemonClientImpl(http);

      await expect(invoke(client)).resolves.toEqual(response);

      expect(http.requestJson).toHaveBeenCalledOnce();
      expect(http.requestJson).toHaveBeenCalledWith(path, {
        method: "POST",
      }, undefined);
    },
  );

  test.each([
    {
      name: "increase",
      invoke: (client: DaemonClientImpl) => client.increase(),
      path: "/daemon/increase?amount=1",
    },
    {
      name: "decrease",
      invoke: (client: DaemonClientImpl) => client.decrease(),
      path: "/daemon/decrease?amount=1",
    },
  ])("uses one as the default amount for $name", async ({ invoke, path }) => {
    const http = createHttpMock();
    http.requestJson.mockResolvedValue({
      running: true,
      num_workers: 1,
    });

    const client = new DaemonClientImpl(http);

    await invoke(client);

    expect(http.requestJson).toHaveBeenCalledWith(path, {
      method: "POST",
    }, undefined);
  });

  test("forwards request options to daemon endpoints", async () => {
    const requestOptions = {
      timeout: 1_500,
      headers: { "X-Request-ID": "status-check" },
    };
    const http = createHttpMock();
    http.requestJson.mockResolvedValue({
      running: true,
      num_workers: 1,
    });

    await new DaemonClientImpl(http).status(requestOptions);

    expect(http.requestJson).toHaveBeenCalledWith(
      "/daemon/status",
      { method: "GET" },
      requestOptions,
    );
  });

  test("propagates errors from the HTTP client", async () => {
    const error = new Error("Request failed");

    const http = createHttpMock();
    http.requestJson.mockRejectedValue(error);

    const client = new DaemonClientImpl(http);

    await expect(client.stop()).rejects.toBe(error);
  });
});
