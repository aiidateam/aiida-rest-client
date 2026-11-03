import type { DaemonClient } from "./daemon";
import type { NodesClient } from "./nodes";
import type { ProcessesClient } from "./processes";

export interface AiidaRestClient {
  readonly daemon: DaemonClient;
  readonly nodes: NodesClient;
  readonly processes: ProcessesClient;
}
