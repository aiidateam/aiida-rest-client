import type { AiidaHttpClient } from "./types";
import type { RequestOptions } from "./types/config";
import type {
  ComputerCollectionDocument,
  ComputerResourceDocument,
  ComputersClient,
} from "./types/computers";
import type { EntitySchemaOptions } from "./types/entities";
import type { NodeIdentifier, NodeListOptions } from "./types/nodes";
import type { JsonApiResourceDocument } from "./types/jsonapi";
import {
  collectionPath,
  includeQuery,
  resourcePath,
  schemaPath,
} from "./query";

export class ComputersClientImpl implements ComputersClient {
  constructor(private readonly http: AiidaHttpClient) {}

  schema(
    options: EntitySchemaOptions = {},
    requestOptions?: RequestOptions,
  ): Promise<Record<string, unknown>> {
    return this.http.requestJson(
      schemaPath("computers", options),
      { method: "GET" },
      requestOptions,
    );
  }

  projections(requestOptions?: RequestOptions): Promise<string[]> {
    return this.http.requestJson(
      "/computers/projections",
      { method: "GET" },
      requestOptions,
    );
  }

  list(
    options?: NodeListOptions,
    requestOptions?: RequestOptions,
  ): Promise<ComputerCollectionDocument> {
    return this.http.requestJson(
      collectionPath("/computers", options),
      { method: "GET" },
      requestOptions,
    );
  }

  get(
    identifier: NodeIdentifier,
    include?: string[],
    requestOptions?: RequestOptions,
  ): Promise<ComputerResourceDocument> {
    return this.http.requestJson(
      `${resourcePath("computers", identifier)}${includeQuery(include)}`,
      { method: "GET" },
      requestOptions,
    );
  }

  metadata(
    identifier: NodeIdentifier,
    include?: string[],
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument> {
    return this.http.requestJson(
      `${resourcePath("computers", identifier)}/metadata${includeQuery(include)}`,
      { method: "GET" },
      requestOptions,
    );
  }
}
