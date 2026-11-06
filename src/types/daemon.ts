import type { RequestOptions } from "./config";

export interface DaemonStatus {
  running: boolean;
  num_workers: number | null;
}

export interface DaemonWorker {
  pid: number;
  mem: number;
  cpu: number;
  started: number;
}

export type DaemonWorkersByIdentifier = Record<string, DaemonWorker>;

export interface DaemonClient {
  status(requestOptions?: RequestOptions): Promise<DaemonStatus>;
  workers(requestOptions?: RequestOptions): Promise<DaemonWorkersByIdentifier>;
  start(requestOptions?: RequestOptions): Promise<DaemonStatus>;
  stop(requestOptions?: RequestOptions): Promise<DaemonStatus>;
  restart(requestOptions?: RequestOptions): Promise<DaemonStatus>;
  increase(amount?: number, requestOptions?: RequestOptions): Promise<DaemonStatus>;
  decrease(amount?: number, requestOptions?: RequestOptions): Promise<DaemonStatus>;
}
