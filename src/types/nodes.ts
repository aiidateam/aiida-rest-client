import type {
  JsonApiCollectionDocument,
  JsonApiResource,
  JsonApiResourceDocument,
} from "./jsonapi";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type NodeIdentifier = string | number;

export interface NodeAttributes extends Record<string, unknown> {
  uuid?: string;
  label?: string;
  description?: string;
  node_type?: string;
  process_type?: string | null;
  ctime?: string;
  mtime?: string;
  attributes?: Record<string, unknown>;
}

export type NodeResource = JsonApiResource<NodeAttributes>;
export type NodeAttributesResource = JsonApiResource<Record<string, unknown>>;
export type NodeExtrasResource = JsonApiResource<Record<string, unknown>>;
export type NodeRelatedResource = JsonApiResource<Record<string, unknown>>;

export interface NodeLinkAttributes extends Record<string, unknown> {
  link_id: string;
  link_label: string;
  link_type: string;
}

export interface NodeLinkRelationship {
  data?: Pick<JsonApiResource, "id" | "type"> | null;
}

export type NodeLinkResource = JsonApiResource<NodeLinkAttributes> & {
  relationships?: {
    source?: NodeLinkRelationship;
    target?: NodeLinkRelationship;
  };
};

export interface NodeListOptions {
  filters?: Record<string, JsonValue>;
  orderBy?: string | string[] | Record<string, JsonValue>;
  page?: number;
  pageSize?: number;
  offset?: number;
  include?: string[];
}

export interface NodeSchemaOptions {
  nodeType?: string;
  which?: "read" | "write" | "constructor";
}

export interface NodeStatistics {
  total: number;
  types: Record<string, number>;
  ctime_by_day: Record<string, number>;
}

export interface NodeType {
  label: string;
  node_type: string;
  nodes: string;
  projections: string;
  node_schema: string;
}

export type NodeDownloadFormats = Record<string, string[]>;
export type NodeSchema = Record<string, unknown>;

export interface NodeRepoFileMetadata {
  type: "FILE";
  binary: boolean;
  size: number;
  hash: string;
  download: string;
}

export interface NodeRepoDirectoryMetadata {
  type: "DIRECTORY";
  objects: Record<string, NodeRepoMetadataEntry>;
}

export type NodeRepoMetadataEntry =
  | NodeRepoFileMetadata
  | NodeRepoDirectoryMetadata;
export type NodeRepoMetadata = Record<string, NodeRepoMetadataEntry>;
export type NodeRepoMetadataResource = JsonApiResource<NodeRepoMetadata>;

export interface NodeCreateRequest {
  node_type: string;
  label?: string;
  description?: string;
  attributes: Record<string, JsonValue>;
}

export interface NodesClient {
  schema(options?: NodeSchemaOptions): Promise<NodeSchema>;
  projections(nodeType?: string): Promise<string[]>;
  statistics(user?: number): Promise<NodeStatistics>;
  downloadFormats(): Promise<NodeDownloadFormats>;
  types(): Promise<NodeType[]>;
  list(
    options?: NodeListOptions,
  ): Promise<JsonApiCollectionDocument<NodeResource>>;
  get(
    identifier: NodeIdentifier,
    include?: string[],
  ): Promise<JsonApiResourceDocument<NodeResource>>;
  user(
    identifier: NodeIdentifier,
  ): Promise<JsonApiResourceDocument<NodeRelatedResource>>;
  computer(
    identifier: NodeIdentifier,
  ): Promise<JsonApiResourceDocument<NodeRelatedResource>>;
  groups(
    identifier: NodeIdentifier,
    options?: NodeListOptions,
  ): Promise<JsonApiCollectionDocument<NodeRelatedResource>>;
  attributes(
    identifier: NodeIdentifier,
    include?: string[],
  ): Promise<JsonApiResourceDocument<NodeAttributesResource>>;
  extras(
    identifier: NodeIdentifier,
    include?: string[],
  ): Promise<JsonApiResourceDocument<NodeExtrasResource>>;
  links(
    identifier: NodeIdentifier,
    direction: "incoming" | "outgoing",
    options?: NodeListOptions,
  ): Promise<JsonApiCollectionDocument<NodeLinkResource>>;
  repoMetadata(
    identifier: NodeIdentifier,
    include?: string[],
  ): Promise<JsonApiResourceDocument<NodeRepoMetadataResource>>;
  repoContents(identifier: NodeIdentifier, filename?: string): Promise<Blob>;
  download(
    identifier: NodeIdentifier,
    format: string,
    options?: Record<string, JsonValue>,
  ): Promise<Blob>;
  create(
    request: NodeCreateRequest,
  ): Promise<JsonApiResourceDocument<NodeResource>>;
}
