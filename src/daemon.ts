import type {
  DaemonClient,
  DaemonStatus,
  DaemonWorkersByIdentifier,
  JsonHttpClient,
} from "./types";

export class DaemonClientImpl implements DaemonClient {
  constructor(private readonly http: JsonHttpClient) {}

  status(): Promise<DaemonStatus> {
    return this.http.requestJson<DaemonStatus>("/daemon/status", {
      method: "GET",
    });
  }

  workers(): Promise<DaemonWorkersByIdentifier> {
    return this.http.requestJson<DaemonWorkersByIdentifier>("/daemon/workers", {
      method: "GET",
    });
  }

  start(): Promise<DaemonStatus> {
    return this.http.requestJson<DaemonStatus>("/daemon/start", {
      method: "POST",
    });
  }

  stop(): Promise<DaemonStatus> {
    return this.http.requestJson<DaemonStatus>("/daemon/stop", {
      method: "POST",
    });
  }

  restart(): Promise<DaemonStatus> {
    return this.http.requestJson<DaemonStatus>("/daemon/restart", {
      method: "POST",
    });
  }

  increase(amount: number = 1): Promise<DaemonStatus> {
    const params = new URLSearchParams({
      amount: String(amount),
    });
    return this.http.requestJson<DaemonStatus>(`/daemon/increase?${params}`, {
      method: "POST",
    });
  }

  decrease(amount: number = 1): Promise<DaemonStatus> {
    const params = new URLSearchParams({
      amount: String(amount),
    });
    return this.http.requestJson<DaemonStatus>(`/daemon/decrease?${params}`, {
      method: "POST",
    });
  }
}
