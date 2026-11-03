export interface JsonHttpClient {
  requestJson<T>(url: string, options: RequestInit): Promise<T>;
}

export interface AiidaHttpClient extends JsonHttpClient {
  requestBlob(url: string, options?: RequestInit): Promise<Blob>;
}
