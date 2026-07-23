import { AiidaRestApiError } from "./errors";
import type { JsonApiErrorDocument } from "./types";

export interface ClientConfig {
  baseUrl: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export class HttpClient {
  private readonly baseUrl: string;

  private readonly timeoutMs: number;

  private readonly headers: Record<string, string>;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
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
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        headers: {
          Accept: "application/json",
          ...this.headers,
          ...(init?.headers ?? {}),
        },
        signal: controller.signal,
      });

      const contentType = response.headers.get("content-type") ?? "";
      const isJson = contentType.includes("application/json");
      const payload = isJson ? await response.json() : undefined;

      if (!response.ok) {
        const errors = (payload as JsonApiErrorDocument | undefined)?.errors;
        const detail = errors?.[0]?.detail;
        const title = errors?.[0]?.title;
        const message =
          detail ?? title ?? `Request failed with status ${response.status}`;
        throw new AiidaRestApiError(message, response.status, payload, errors);
      }

      return payload as TResponse;
    } catch (error) {
      if (error instanceof AiidaRestApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new AiidaRestApiError("Request timed out.", 408);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
