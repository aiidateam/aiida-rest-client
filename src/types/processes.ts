import type { JsonValue } from "./nodes";
import type { JsonApiResourceDocument } from "./jsonapi";
import type { NodeResource } from "./nodes";
import type { RequestOptions } from "./config";

export type ProcessInputs = Record<string, JsonValue>;

export interface ProcessSubmission {
  entryPoint: string;
  inputs: ProcessInputs;
  label?: string;
  description?: string;
}

export interface ProcessesClient {
  submit(
    submission: ProcessSubmission,
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument<NodeResource>>;
}
