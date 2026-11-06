import type { AiidaHttpClient } from "./types";
import type { RequestOptions } from "./types/config";
import type { EntitySchemaOptions } from "./types/entities";
import type {
  GroupCollectionDocument,
  GroupResourceDocument,
  GroupsClient,
} from "./types/groups";
import type { UserResource } from "./types/users";
import type { JsonApiResourceDocument } from "./types/jsonapi";
import type {
  NodeCollectionDocument,
  NodeIdentifier,
  NodeListOptions,
} from "./types/nodes";
import {
  collectionPath,
  includeQuery,
  resourcePath,
  schemaPath,
} from "./query";

export class GroupsClientImpl implements GroupsClient {
  constructor(private readonly http: AiidaHttpClient) {}

  schema(
    options: EntitySchemaOptions = {},
    requestOptions?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    return this.http.requestJson(
      schemaPath("groups", options),
      { method: "GET" },
      requestOptions,
    );
  }

  projections(requestOptions?: RequestOptions): Promise<string[]> {
    return this.http.requestJson(
      "/groups/projections",
      { method: "GET" },
      requestOptions,
    );
  }

  list(
    options?: NodeListOptions,
    requestOptions?: RequestOptions,
  ): Promise<GroupCollectionDocument> {
    return this.http.requestJson(
      collectionPath("/groups", options),
      { method: "GET" },
      requestOptions,
    );
  }

  get(
    identifier: NodeIdentifier,
    include?: string[],
    requestOptions?: RequestOptions,
  ): Promise<GroupResourceDocument> {
    return this.http.requestJson(
      `${resourcePath("groups", identifier)}${includeQuery(include)}`,
      { method: "GET" },
      requestOptions,
    );
  }

  user(
    identifier: NodeIdentifier,
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument<UserResource>> {
    return this.http.requestJson(
      `${resourcePath("groups", identifier)}/user`,
      { method: "GET" },
      requestOptions,
    );
  }

  nodes(
    identifier: NodeIdentifier,
    options?: NodeListOptions,
    requestOptions?: RequestOptions,
  ): Promise<NodeCollectionDocument> {
    return this.http.requestJson(
      collectionPath(`${resourcePath("groups", identifier)}/nodes`, options),
      { method: "GET" },
      requestOptions,
    );
  }

  extras(
    identifier: NodeIdentifier,
    include?: string[],
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument> {
    return this.http.requestJson(
      `${resourcePath("groups", identifier)}/extras${includeQuery(include)}`,
      { method: "GET" },
      requestOptions,
    );
  }
}
