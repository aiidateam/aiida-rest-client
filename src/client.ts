import { ComputersClientImpl } from "./computers";
import { DaemonClientImpl } from "./daemon";
import { GroupsClientImpl } from "./groups";
import { HttpClient } from "./http";
import { NodesClientImpl } from "./nodes";
import { ProcessesClientImpl } from "./processes";
import { ServerClientImpl } from "./server";
import { UsersClientImpl } from "./users";
import type { ClientConfig, DaemonClient } from "./types";
import type {
  AiidaRestClient,
  ComputersClient,
  GroupsClient,
  NodesClient,
  ProcessesClient,
  ServerClient,
  UsersClient,
} from "./types";

class AiidaRestClientImpl implements AiidaRestClient {
  readonly computers: ComputersClient;
  readonly daemon: DaemonClient;
  readonly groups: GroupsClient;
  readonly nodes: NodesClient;
  readonly processes: ProcessesClient;
  readonly server: ServerClient;
  readonly users: UsersClient;

  constructor(config: ClientConfig) {
    const apiPrefix = (config.apiPrefix ?? "/v0").replace(/\/$/, "");
    const http = new HttpClient({
      ...config,
      baseUrl: `${config.baseUrl.replace(/\/$/, "")}`,
      apiPrefix,
    });

    this.computers = new ComputersClientImpl(http);
    this.daemon = new DaemonClientImpl(http);
    this.groups = new GroupsClientImpl(http);
    this.nodes = new NodesClientImpl(http);
    this.processes = new ProcessesClientImpl(http);
    this.server = new ServerClientImpl(http);
    this.users = new UsersClientImpl(http);
  }
}

export function createAiidaRestClient(config: ClientConfig): AiidaRestClient {
  return new AiidaRestClientImpl(config);
}
