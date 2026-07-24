export interface ClientConfig {
  baseUrl: string;
  apiPrefix?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
}
