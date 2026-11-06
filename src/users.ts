import type { AiidaHttpClient } from "./types";
import type { RequestOptions } from "./types/config";
import type { EntitySchemaOptions } from "./types/entities";
import type { NodeListOptions } from "./types/nodes";
import type {
  UserCollectionDocument,
  UserResourceDocument,
  UsersClient,
} from "./types/users";
import {
  collectionPath,
  includeQuery,
  resourcePath,
  schemaPath,
} from "./query";

export class UsersClientImpl implements UsersClient {
  constructor(private readonly http: AiidaHttpClient) {}

  schema(
    options: EntitySchemaOptions = {},
    requestOptions?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    return this.http.requestJson(
      schemaPath("users", options),
      { method: "GET" },
      requestOptions,
    );
  }

  projections(requestOptions?: RequestOptions): Promise<string[]> {
    return this.http.requestJson(
      "/users/projections",
      { method: "GET" },
      requestOptions,
    );
  }

  list(
    options?: NodeListOptions,
    requestOptions?: RequestOptions,
  ): Promise<UserCollectionDocument> {
    return this.http.requestJson(
      collectionPath("/users", options),
      { method: "GET" },
      requestOptions,
    );
  }

  get(
    identifier: number,
    include?: string[],
    requestOptions?: RequestOptions,
  ): Promise<UserResourceDocument> {
    return this.http.requestJson(
      `${resourcePath("users", identifier)}${includeQuery(include)}`,
      { method: "GET" },
      requestOptions,
    );
  }
}
