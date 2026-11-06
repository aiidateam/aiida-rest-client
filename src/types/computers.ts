import type {
  JsonApiCollectionDocument,
  JsonApiResource,
  JsonApiResourceDocument,
} from "./jsonapi";
import type { RequestOptions } from "./config";
import type { NodeIdentifier, NodeListOptions } from "./nodes";
import type { EntitySchemaOptions } from "./entities";

export type ComputerResource = JsonApiResource;
export type ComputerCollectionDocument =
  JsonApiCollectionDocument<ComputerResource>;
export type ComputerResourceDocument =
  JsonApiResourceDocument<ComputerResource>;

export interface ComputersClient {
  schema(
    options?: EntitySchemaOptions,
    requestOptions?: RequestOptions,
  ): Promise<Record<string, unknown>>;
  projections(requestOptions?: RequestOptions): Promise<string[]>;
  list(
    options?: NodeListOptions,
    requestOptions?: RequestOptions,
  ): Promise<ComputerCollectionDocument>;
  get(
    identifier: NodeIdentifier,
    include?: string[],
    requestOptions?: RequestOptions,
  ): Promise<ComputerResourceDocument>;
  metadata(
    identifier: NodeIdentifier,
    include?: string[],
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument>;
}
