import type {
  JsonApiCollectionDocument,
  JsonApiResourceDocument,
} from "./types";

import type {
  NodeAttributesResource,
  NodeCreateRequest,
  NodeDownloadFormats,
  NodeExtrasResource,
  NodeIdentifier,
  NodeLinkResource,
  NodeListOptions,
  NodeRelatedResource,
  NodeRepoMetadataResource,
  NodeResource,
  NodeSchema,
  NodeSchemaOptions,
  NodeStatistics,
  NodeType,
  JsonValue,
  NodesClient,
} from "./types/nodes";

import type { AiidaHttpClient } from "./types";
import type { RequestOptions } from "./types/config";

function collectionQuery(options: NodeListOptions = {}): string {
  const params = new URLSearchParams();
  if (options.filters) params.set("filters", JSON.stringify(options.filters));
  if (options.orderBy) params.set("order_by", JSON.stringify(options.orderBy));
  if (options.page !== undefined) params.set("page", String(options.page));
  if (options.pageSize !== undefined)
    params.set("page_size", String(options.pageSize));
  if (options.offset !== undefined)
    params.set("offset", String(options.offset));
  if (options.include?.length) params.set("include", options.include.join(","));
  return params.toString();
}

function includeQuery(include?: string[]): string {
  if (!include?.length) return "";
  return `?${new URLSearchParams({ include: include.join(",") })}`;
}

function nodePath(identifier: NodeIdentifier): string {
  return `/nodes/${encodeURIComponent(String(identifier))}`;
}

function collectionPath(path: string, options?: NodeListOptions): string {
  const query = collectionQuery(options);
  return query ? `${path}?${query}` : path;
}

export class NodesClientImpl implements NodesClient {
  constructor(private readonly http: AiidaHttpClient) {}

  schema(
    options: NodeSchemaOptions = {},
    requestOptions?: RequestOptions,
  ): Promise<NodeSchema> {
    const params = new URLSearchParams();
    if (options.nodeType) params.set("type", options.nodeType);
    if (options.which) params.set("which", options.which);
    const query = params.toString();
    return this.http.requestJson(
      `/nodes/schema${query ? `?${query}` : ""}`,
      { method: "GET" },
      requestOptions,
    );
  }

  projections(
    nodeType?: string,
    requestOptions?: RequestOptions,
  ): Promise<string[]> {
    const params = new URLSearchParams();
    if (nodeType) params.set("type", nodeType);
    const query = params.toString();
    return this.http.requestJson(
      `/nodes/projections${query ? `?${query}` : ""}`,
      { method: "GET" },
      requestOptions,
    );
  }

  statistics(
    user?: number,
    requestOptions?: RequestOptions,
  ): Promise<NodeStatistics> {
    const params = new URLSearchParams();
    if (user !== undefined) params.set("user", String(user));
    const query = params.toString();
    return this.http.requestJson(
      `/nodes/statistics${query ? `?${query}` : ""}`,
      { method: "GET" },
      requestOptions,
    );
  }

  downloadFormats(requestOptions?: RequestOptions): Promise<NodeDownloadFormats> {
    return this.http.requestJson(
      "/nodes/download_formats",
      { method: "GET" },
      requestOptions,
    );
  }

  types(requestOptions?: RequestOptions): Promise<NodeType[]> {
    return this.http.requestJson(
      "/nodes/types",
      { method: "GET" },
      requestOptions,
    );
  }

  list(
    options?: NodeListOptions,
    requestOptions?: RequestOptions,
  ): Promise<JsonApiCollectionDocument<NodeResource>> {
    return this.http.requestJson(collectionPath("/nodes", options), {
      method: "GET",
    }, requestOptions);
  }

  get(
    identifier: NodeIdentifier,
    include?: string[],
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument<NodeResource>> {
    return this.http.requestJson(
      `${nodePath(identifier)}${includeQuery(include)}`,
      { method: "GET" },
      requestOptions,
    );
  }

  user(
    identifier: NodeIdentifier,
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument<NodeRelatedResource>> {
    return this.http.requestJson(
      `${nodePath(identifier)}/user`,
      { method: "GET" },
      requestOptions,
    );
  }

  computer(
    identifier: NodeIdentifier,
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument<NodeRelatedResource>> {
    return this.http.requestJson(
      `${nodePath(identifier)}/computer`,
      { method: "GET" },
      requestOptions,
    );
  }

  groups(
    identifier: NodeIdentifier,
    options?: NodeListOptions,
    requestOptions?: RequestOptions,
  ): Promise<JsonApiCollectionDocument<NodeRelatedResource>> {
    return this.http.requestJson(
      collectionPath(`${nodePath(identifier)}/groups`, options),
      { method: "GET" },
      requestOptions,
    );
  }

  attributes(
    identifier: NodeIdentifier,
    include?: string[],
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument<NodeAttributesResource>> {
    return this.http.requestJson(
      `${nodePath(identifier)}/attributes${includeQuery(include)}`,
      { method: "GET" },
      requestOptions,
    );
  }

  extras(
    identifier: NodeIdentifier,
    include?: string[],
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument<NodeExtrasResource>> {
    return this.http.requestJson(
      `${nodePath(identifier)}/extras${includeQuery(include)}`,
      { method: "GET" },
      requestOptions,
    );
  }

  links(
    identifier: NodeIdentifier,
    direction: "incoming" | "outgoing",
    options?: NodeListOptions,
    requestOptions?: RequestOptions,
  ): Promise<JsonApiCollectionDocument<NodeLinkResource>> {
    const params = new URLSearchParams(collectionQuery(options));
    params.set("direction", direction);
    return this.http.requestJson(
      `${nodePath(identifier)}/links?${params}`,
      { method: "GET" },
      requestOptions,
    );
  }

  repoMetadata(
    identifier: NodeIdentifier,
    include?: string[],
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument<NodeRepoMetadataResource>> {
    return this.http.requestJson(
      `${nodePath(identifier)}/repo/metadata${includeQuery(include)}`,
      { method: "GET" },
      requestOptions,
    );
  }

  repoContents(
    identifier: NodeIdentifier,
    filename?: string,
    requestOptions?: RequestOptions,
  ): Promise<Blob> {
    const params = new URLSearchParams();
    if (filename) params.set("filename", filename);
    const query = params.toString();
    return this.http.requestBlob(
      `${nodePath(identifier)}/repo/contents${query ? `?${query}` : ""}`,
      { method: "GET" },
      requestOptions,
    );
  }

  download(
    identifier: NodeIdentifier,
    format: string,
    options?: Record<string, JsonValue>,
    requestOptions?: RequestOptions,
  ): Promise<Blob> {
    const params = new URLSearchParams({ format });
    if (options) params.set("options", JSON.stringify(options));
    return this.http.requestBlob(
      `${nodePath(identifier)}/download?${params}`,
      { method: "GET" },
      requestOptions,
    );
  }

  create(
    request: NodeCreateRequest,
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument<NodeResource>> {
    return this.http.requestJson("/nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }, requestOptions);
  }
}
