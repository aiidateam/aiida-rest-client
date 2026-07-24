import { HttpClient } from "./http";
import type { DaemonStatus, DaemonWorkersByIdentifier } from "./types";

export class DaemonClient {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  status(): Promise<DaemonStatus> {
    return this.http.requestJson<DaemonStatus>("/daemon/status", {
      method: "GET",
    });
  }

  worker(): Promise<DaemonWorkersByIdentifier> {
    return this.http.requestJson<DaemonWorkersByIdentifier>("/daemon/worker", {
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

  increase(): Promise<DaemonStatus> {
    return this.http.requestJson<DaemonStatus>("/daemon/increase", {
      method: "POST",
    });
  }

  decrease(): Promise<DaemonStatus> {
    return this.http.requestJson<DaemonStatus>("/daemon/decrease", {
      method: "POST",
    });
  }
}
