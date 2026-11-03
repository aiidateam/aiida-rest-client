import { DaemonClientImpl } from "./daemon";
import { HttpClient } from "./http";
import { NodesClientImpl } from "./nodes";
import { ProcessesClientImpl } from "./processes";
import type { ClientConfig, DaemonClient } from "./types";
import type { AiidaRestClient, NodesClient, ProcessesClient } from "./types";

class AiidaRestClientImpl implements AiidaRestClient {
  readonly daemon: DaemonClient;
  readonly nodes: NodesClient;
  readonly processes: ProcessesClient;

  constructor(config: ClientConfig) {
    const apiPrefix = (config.apiPrefix ?? "/v0").replace(/\/$/, "");
    const http = new HttpClient({
      ...config,
      baseUrl: `${config.baseUrl.replace(/\/$/, "")}`,
      apiPrefix,
    });

    this.daemon = new DaemonClientImpl(http);
    this.nodes = new NodesClientImpl(http);
    this.processes = new ProcessesClientImpl(http);
  }
}

export function createAiidaRestClient(config: ClientConfig): AiidaRestClient {
  return new AiidaRestClientImpl(config);
}
