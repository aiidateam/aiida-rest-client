import type { ComputersClient } from "./computers";
import type { DaemonClient } from "./daemon";
import type { GroupsClient } from "./groups";
import type { NodesClient } from "./nodes";
import type { ProcessesClient } from "./processes";
import type { ServerClient } from "./server";
import type { UsersClient } from "./users";

export interface AiidaRestClient {
  readonly computers: ComputersClient;
  readonly daemon: DaemonClient;
  readonly groups: GroupsClient;
  readonly nodes: NodesClient;
  readonly processes: ProcessesClient;
  readonly server: ServerClient;
  readonly users: UsersClient;
}
