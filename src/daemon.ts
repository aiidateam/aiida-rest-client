import type {
  DaemonClient,
  DaemonStatus,
  DaemonWorkersByIdentifier,
  JsonHttpClient,
  RequestOptions,
} from "./types";

export class DaemonClientImpl implements DaemonClient {
  constructor(private readonly http: JsonHttpClient) {}

  status(requestOptions?: RequestOptions): Promise<DaemonStatus> {
    return this.http.requestJson<DaemonStatus>("/daemon/status", {
      method: "GET",
    }, requestOptions);
  }

  workers(
    requestOptions?: RequestOptions,
  ): Promise<DaemonWorkersByIdentifier> {
    return this.http.requestJson<DaemonWorkersByIdentifier>("/daemon/workers", {
      method: "GET",
    }, requestOptions);
  }

  start(requestOptions?: RequestOptions): Promise<DaemonStatus> {
    return this.http.requestJson<DaemonStatus>("/daemon/start", {
      method: "POST",
    }, requestOptions);
  }

  stop(requestOptions?: RequestOptions): Promise<DaemonStatus> {
    return this.http.requestJson<DaemonStatus>("/daemon/stop", {
      method: "POST",
    }, requestOptions);
  }

  restart(requestOptions?: RequestOptions): Promise<DaemonStatus> {
    return this.http.requestJson<DaemonStatus>("/daemon/restart", {
      method: "POST",
    }, requestOptions);
  }

  increase(
    amount: number = 1,
    requestOptions?: RequestOptions,
  ): Promise<DaemonStatus> {
    const params = new URLSearchParams({
      amount: String(amount),
    });
    return this.http.requestJson<DaemonStatus>(`/daemon/increase?${params}`, {
      method: "POST",
    }, requestOptions);
  }

  decrease(
    amount: number = 1,
    requestOptions?: RequestOptions,
  ): Promise<DaemonStatus> {
    const params = new URLSearchParams({
      amount: String(amount),
    });
    return this.http.requestJson<DaemonStatus>(`/daemon/decrease?${params}`, {
      method: "POST",
    }, requestOptions);
  }
}
