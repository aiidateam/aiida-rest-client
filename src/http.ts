import { JsonApiError } from "./jsonapi";
import type { AiidaHttpClient, ClientConfig, JsonApiDocument } from "./types";

export class HttpClient implements AiidaHttpClient {
  private readonly baseUrl: string;
  private readonly apiPrefix: string;
  private readonly timeoutMs: number;
  private readonly headers: Record<string, string>;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiPrefix = (config.apiPrefix ?? "/v0").replace(/\/$/, "");
    this.timeoutMs = config.timeoutMs ?? 30_000;
    this.headers = config.headers ?? {};
  }

  async requestJson<TResponse>(
    path: string,
    init?: RequestInit,
  ): Promise<TResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${this.apiPrefix}${path}`, {
        ...init,
        headers: {
          Accept: "application/json",
          ...this.headers,
          ...(init?.headers ?? {}),
        },
        signal: controller.signal,
      });

      const contentType = response.headers.get("content-type") ?? "";
      const isJson = this.isJson(contentType);
      const payload = isJson ? await response.json() : undefined;

      if (!response.ok) {
        throw this.createError(response.status, payload);
      }

      return payload as TResponse;
    } catch (error) {
      if (error instanceof JsonApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new JsonApiError("Request timed out.", 408);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async requestBlob(path: string, init?: RequestInit): Promise<Blob> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${this.apiPrefix}${path}`, {
        ...init,
        headers: {
          Accept: "*/*",
          ...this.headers,
          ...(init?.headers ?? {}),
        },
        signal: controller.signal,
      });

      const contentType = response.headers.get("content-type") ?? "";
      const payload = this.isJson(contentType) ? await response.json() : undefined;
      if (!response.ok) {
        throw this.createError(response.status, payload);
      }

      return await response.blob();
    } catch (error) {
      if (error instanceof JsonApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new JsonApiError("Request timed out.", 408);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private isJson(contentType: string): boolean {
    return (
      contentType.includes("application/json") || contentType.includes("+json")
    );
  }

  private createError(statusCode: number, payload: unknown): JsonApiError {
    const errors = (payload as JsonApiDocument | undefined)?.errors;
    const detail = errors?.[0]?.detail;
    const title = errors?.[0]?.title;
    const message = detail ?? title ?? `Request failed with status ${statusCode}`;
    return new JsonApiError(message, statusCode, payload, errors);
  }
}
