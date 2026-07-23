import { DaemonClient } from "./daemon";
import { HttpClient, type ClientConfig } from "./http";

export interface AiidaRestClientConfig extends ClientConfig {
  apiPrefix?: string;
}

export class AiidaRestClient {
  readonly daemon: DaemonClient;

  constructor(config: AiidaRestClientConfig) {
    const apiPrefix = (config.apiPrefix ?? "/v0").replace(/\/$/, "");
    const http = new HttpClient({
      ...config,
      baseUrl: `${config.baseUrl.replace(/\/$/, "")}${apiPrefix}`,
    });

    this.daemon = new DaemonClient(http);
  }
}

export function createAiidaRestClient(
  config: AiidaRestClientConfig,
): AiidaRestClient {
  return new AiidaRestClient(config);
}
