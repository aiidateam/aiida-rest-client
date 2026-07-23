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

export interface JsonApiErrorEntry {
  status?: string;
  title?: string;
  detail?: string;
}

export interface JsonApiErrorDocument {
  errors?: JsonApiErrorEntry[];
}
