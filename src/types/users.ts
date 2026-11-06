import type {
  JsonApiCollectionDocument,
  JsonApiResource,
  JsonApiResourceDocument,
} from "./jsonapi";
import type { RequestOptions } from "./config";
import type { NodeListOptions } from "./nodes";
import type { EntitySchemaOptions } from "./entities";

export type UserResource = JsonApiResource;
export type UserCollectionDocument = JsonApiCollectionDocument<UserResource>;
export type UserResourceDocument = JsonApiResourceDocument<UserResource>;

export interface UsersClient {
  schema(
    options?: EntitySchemaOptions,
    requestOptions?: RequestOptions,
  ): Promise<Record<string, unknown>>;
  projections(requestOptions?: RequestOptions): Promise<string[]>;
  list(
    options?: NodeListOptions,
    requestOptions?: RequestOptions,
  ): Promise<UserCollectionDocument>;
  get(
    identifier: number,
    include?: string[],
    requestOptions?: RequestOptions,
  ): Promise<UserResourceDocument>;
}
