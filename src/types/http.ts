export interface JsonHttpClient {
  requestJson<T>(url: string, options: RequestInit): Promise<T>;
}
