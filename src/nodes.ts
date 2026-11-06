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

  schema(options: NodeSchemaOptions = {}): Promise<NodeSchema> {
    const params = new URLSearchParams();
    if (options.nodeType) params.set("type", options.nodeType);
    if (options.which) params.set("which", options.which);
    const query = params.toString();
    return this.http.requestJson(`/nodes/schema${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  }

  projections(nodeType?: string): Promise<string[]> {
    const params = new URLSearchParams();
    if (nodeType) params.set("type", nodeType);
    const query = params.toString();
    return this.http.requestJson(
      `/nodes/projections${query ? `?${query}` : ""}`,
      { method: "GET" },
    );
  }

  statistics(user?: number): Promise<NodeStatistics> {
    const params = new URLSearchParams();
    if (user !== undefined) params.set("user", String(user));
    const query = params.toString();
    return this.http.requestJson(
      `/nodes/statistics${query ? `?${query}` : ""}`,
      { method: "GET" },
    );
  }

  downloadFormats(): Promise<NodeDownloadFormats> {
    return this.http.requestJson("/nodes/download_formats", {
      method: "GET",
    });
  }

  types(): Promise<NodeType[]> {
    return this.http.requestJson("/nodes/types", { method: "GET" });
  }

  list(
    options?: NodeListOptions,
  ): Promise<JsonApiCollectionDocument<NodeResource>> {
    return this.http.requestJson(collectionPath("/nodes", options), {
      method: "GET",
    });
  }

  get(
    identifier: NodeIdentifier,
    include?: string[],
  ): Promise<JsonApiResourceDocument<NodeResource>> {
    return this.http.requestJson(
      `${nodePath(identifier)}${includeQuery(include)}`,
      { method: "GET" },
    );
  }

  user(
    identifier: NodeIdentifier,
  ): Promise<JsonApiResourceDocument<NodeRelatedResource>> {
    return this.http.requestJson(`${nodePath(identifier)}/user`, {
      method: "GET",
    });
  }

  computer(
    identifier: NodeIdentifier,
  ): Promise<JsonApiResourceDocument<NodeRelatedResource>> {
    return this.http.requestJson(`${nodePath(identifier)}/computer`, {
      method: "GET",
    });
  }

  groups(
    identifier: NodeIdentifier,
    options?: NodeListOptions,
  ): Promise<JsonApiCollectionDocument<NodeRelatedResource>> {
    return this.http.requestJson(
      collectionPath(`${nodePath(identifier)}/groups`, options),
      { method: "GET" },
    );
  }

  attributes(
    identifier: NodeIdentifier,
    include?: string[],
  ): Promise<JsonApiResourceDocument<NodeAttributesResource>> {
    return this.http.requestJson(
      `${nodePath(identifier)}/attributes${includeQuery(include)}`,
      { method: "GET" },
    );
  }

  extras(
    identifier: NodeIdentifier,
    include?: string[],
  ): Promise<JsonApiResourceDocument<NodeExtrasResource>> {
    return this.http.requestJson(
      `${nodePath(identifier)}/extras${includeQuery(include)}`,
      { method: "GET" },
    );
  }

  links(
    identifier: NodeIdentifier,
    direction: "incoming" | "outgoing",
    options?: NodeListOptions,
  ): Promise<JsonApiCollectionDocument<NodeLinkResource>> {
    const params = new URLSearchParams(collectionQuery(options));
    params.set("direction", direction);
    return this.http.requestJson(`${nodePath(identifier)}/links?${params}`, {
      method: "GET",
    });
  }

  repoMetadata(
    identifier: NodeIdentifier,
    include?: string[],
  ): Promise<JsonApiResourceDocument<NodeRepoMetadataResource>> {
    return this.http.requestJson(
      `${nodePath(identifier)}/repo/metadata${includeQuery(include)}`,
      { method: "GET" },
    );
  }

  repoContents(identifier: NodeIdentifier, filename?: string): Promise<Blob> {
    const params = new URLSearchParams();
    if (filename) params.set("filename", filename);
    const query = params.toString();
    return this.http.requestBlob(
      `${nodePath(identifier)}/repo/contents${query ? `?${query}` : ""}`,
      { method: "GET" },
    );
  }

  download(
    identifier: NodeIdentifier,
    format: string,
    options?: Record<string, JsonValue>,
  ): Promise<Blob> {
    const params = new URLSearchParams({ format });
    if (options) params.set("options", JSON.stringify(options));
    return this.http.requestBlob(`${nodePath(identifier)}/download?${params}`, {
      method: "GET",
    });
  }

  create(
    request: NodeCreateRequest,
  ): Promise<JsonApiResourceDocument<NodeResource>> {
    return this.http.requestJson("/nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  }
}
