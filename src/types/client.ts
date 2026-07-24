import type { DaemonClient } from "./daemon";

export interface AiidaRestClient {
  readonly daemon: DaemonClient;
}
