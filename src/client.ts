import { DaemonClientImpl } from "./daemon";
import { HttpClient } from "./http";
import type { ClientConfig, DaemonClient } from "./types";
import type { AiidaRestClient } from "./types/client";

class AiidaRestClientImpl implements AiidaRestClient {
  readonly daemon: DaemonClient;

  constructor(config: ClientConfig) {
    const apiPrefix = (config.apiPrefix ?? "/v0").replace(/\/$/, "");
    const http = new HttpClient({
      ...config,
      baseUrl: `${config.baseUrl.replace(/\/$/, "")}`,
      apiPrefix,
    });

    this.daemon = new DaemonClientImpl(http);
  }
}

export function createAiidaRestClient(config: ClientConfig): AiidaRestClient {
  return new AiidaRestClientImpl(config);
}
