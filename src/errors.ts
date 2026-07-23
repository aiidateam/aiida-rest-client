import type { JsonApiErrorDocument } from "./types";

export class AiidaRestApiError extends Error {
  readonly statusCode: number;

  readonly payload?: unknown;

  readonly jsonApiErrors?: JsonApiErrorDocument["errors"];

  constructor(
    message: string,
    statusCode: number,
    payload?: unknown,
    jsonApiErrors?: JsonApiErrorDocument["errors"],
  ) {
    super(message);
    this.name = "AiidaRestApiError";
    this.statusCode = statusCode;
    this.payload = payload;
    this.jsonApiErrors = jsonApiErrors;
  }
}
