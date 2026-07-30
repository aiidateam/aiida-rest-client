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
  status(): Promise<DaemonStatus>;
  workers(): Promise<DaemonWorkersByIdentifier>;
  start(): Promise<DaemonStatus>;
  stop(): Promise<DaemonStatus>;
  restart(): Promise<DaemonStatus>;
  increase(amount?: number): Promise<DaemonStatus>;
  decrease(amount?: number): Promise<DaemonStatus>;
}
