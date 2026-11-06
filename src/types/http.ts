import type { RequestOptions } from "./config";

export interface JsonHttpClient {
  requestJson<T>(
    url: string,
    init?: RequestInit,
    requestOptions?: RequestOptions,
  ): Promise<T>;
}

export interface AiidaHttpClient extends JsonHttpClient {
  requestBlob(
    url: string,
    init?: RequestInit,
    requestOptions?: RequestOptions,
  ): Promise<Blob>;
}
