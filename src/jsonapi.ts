import type { JsonApiDocument } from "./types/jsonapi";

export class JsonApiError extends Error {
  readonly statusCode: number;
  readonly payload?: unknown;
  readonly jsonApiErrors?: JsonApiDocument["errors"];

  constructor(
    message: string,
    statusCode: number,
    payload?: unknown,
    jsonApiErrors?: JsonApiDocument["errors"],
  ) {
    super(message);
    this.name = "JsonApiError";
    this.statusCode = statusCode;
    this.payload = payload;
    this.jsonApiErrors = jsonApiErrors;
  }
}
