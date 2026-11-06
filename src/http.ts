import { JsonApiError } from "./jsonapi";
import type {
  AiidaHttpClient,
  ClientConfig,
  JsonApiDocument,
  RequestOptions,
} from "./types";

interface RequestAbort {
  signal: AbortSignal;
  timedOut(): boolean;
  cleanup(): void;
}

function createRequestAbort(
  timeout: number,
  externalSignal?: AbortSignal,
): RequestAbort {
  const controller = new AbortController();
  let timeoutElapsed = false;
  const abortFromCaller = () => {
    if (!controller.signal.aborted) {
      controller.abort(externalSignal?.reason);
    }
  };

  if (externalSignal?.aborted) {
    abortFromCaller();
  } else {
    externalSignal?.addEventListener("abort", abortFromCaller, { once: true });
  }

  const timeoutId = setTimeout(() => {
    if (!controller.signal.aborted) {
      timeoutElapsed = true;
      controller.abort();
    }
  }, timeout);

  return {
    signal: controller.signal,
    timedOut: () => timeoutElapsed,
    cleanup: () => {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", abortFromCaller);
    },
  };
}

export class HttpClient implements AiidaHttpClient {
  private readonly baseUrl: string;
  private readonly apiPrefix: string;
  private readonly timeout: number;
  private readonly headers: Record<string, string>;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiPrefix = (config.apiPrefix ?? "/v0").replace(/\/$/, "");
    this.timeout = config.timeout ?? 30_000;
    this.headers = config.headers ?? {};
  }

  async requestJson<TResponse>(
    path: string,
    init?: RequestInit,
    requestOptions?: RequestOptions,
  ): Promise<TResponse> {
    const requestAbort = createRequestAbort(
      requestOptions?.timeout ?? this.timeout,
      requestOptions?.signal,
    );

    try {
      const response = await fetch(`${this.baseUrl}${this.apiPrefix}${path}`, {
        ...init,
        headers: {
          Accept: "application/json",
          ...this.headers,
          ...(requestOptions?.headers ?? {}),
          ...(init?.headers ?? {}),
        },
        signal: requestAbort.signal,
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

      if (
        requestAbort.timedOut() &&
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new JsonApiError("Request timed out.", 408);
      }

      throw error;
    } finally {
      requestAbort.cleanup();
    }
  }

  async requestBlob(
    path: string,
    init?: RequestInit,
    requestOptions?: RequestOptions,
  ): Promise<Blob> {
    const requestAbort = createRequestAbort(
      requestOptions?.timeout ?? this.timeout,
      requestOptions?.signal,
    );

    try {
      const response = await fetch(`${this.baseUrl}${this.apiPrefix}${path}`, {
        ...init,
        headers: {
          Accept: "*/*",
          ...this.headers,
          ...(requestOptions?.headers ?? {}),
          ...(init?.headers ?? {}),
        },
        signal: requestAbort.signal,
      });

      const contentType = response.headers.get("content-type") ?? "";
      const payload = this.isJson(contentType)
        ? await response.json()
        : undefined;
      if (!response.ok) {
        throw this.createError(response.status, payload);
      }

      return await response.blob();
    } catch (error) {
      if (error instanceof JsonApiError) {
        throw error;
      }

      if (
        requestAbort.timedOut() &&
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new JsonApiError("Request timed out.", 408);
      }

      throw error;
    } finally {
      requestAbort.cleanup();
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
    const message =
      detail ?? title ?? `Request failed with status ${statusCode}`;
    return new JsonApiError(message, statusCode, payload, errors);
  }
}
