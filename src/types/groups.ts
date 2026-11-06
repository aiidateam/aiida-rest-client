import type {
  JsonApiCollectionDocument,
  JsonApiResource,
  JsonApiResourceDocument,
} from "./jsonapi";
import type { RequestOptions } from "./config";
import type { EntitySchemaOptions } from "./entities";
import type { NodeIdentifier, NodeListOptions, NodeResource } from "./nodes";
import type { UserResource } from "./users";

export type GroupResource = JsonApiResource;
export type GroupCollectionDocument = JsonApiCollectionDocument<GroupResource>;
export type GroupResourceDocument = JsonApiResourceDocument<GroupResource>;

export interface GroupsClient {
  schema(
    options?: EntitySchemaOptions,
    requestOptions?: RequestOptions,
  ): Promise<Record<string, unknown>>;
  projections(requestOptions?: RequestOptions): Promise<string[]>;
  list(
    options?: NodeListOptions,
    requestOptions?: RequestOptions,
  ): Promise<GroupCollectionDocument>;
  get(
    identifier: NodeIdentifier,
    include?: string[],
    requestOptions?: RequestOptions,
  ): Promise<GroupResourceDocument>;
  user(
    identifier: NodeIdentifier,
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument<UserResource>>;
  nodes(
    identifier: NodeIdentifier,
    options?: NodeListOptions,
    requestOptions?: RequestOptions,
  ): Promise<JsonApiCollectionDocument<NodeResource>>;
  extras(
    identifier: NodeIdentifier,
    include?: string[],
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument>;
}
