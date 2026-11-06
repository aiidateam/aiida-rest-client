export interface RequestOptions {
  /** Request timeout in milliseconds. */
  timeout?: number;
  /** Headers for this request, overriding client defaults. */
  headers?: Record<string, string>;
  /** Caller-controlled cancellation signal. */
  signal?: AbortSignal;
}

export interface ClientConfig extends RequestOptions {
  baseUrl: string;
  apiPrefix?: string;
}
