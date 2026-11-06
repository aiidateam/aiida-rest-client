import type { JsonApiResourceDocument, JsonHttpClient } from "./types";
import type { NodeResource } from "./types/nodes";
import type { ProcessSubmission, ProcessesClient } from "./types/processes";
import type { RequestOptions } from "./types/config";

export class ProcessesClientImpl implements ProcessesClient {
  constructor(private readonly http: JsonHttpClient) {}

  submit(
    submission: ProcessSubmission,
    requestOptions?: RequestOptions,
  ): Promise<JsonApiResourceDocument<NodeResource>> {
    const submittedMetadata = submission.inputs.metadata;
    if (
      submittedMetadata !== undefined &&
      (!submittedMetadata ||
        typeof submittedMetadata !== "object" ||
        Array.isArray(submittedMetadata))
    ) {
      throw new TypeError("Process input metadata must be an object.");
    }
    const existingMetadata =
      submittedMetadata &&
      typeof submittedMetadata === "object" &&
      !Array.isArray(submittedMetadata)
        ? submittedMetadata
        : {};
    const metadata = {
      ...existingMetadata,
      ...(submission.label ? { label: submission.label } : {}),
      ...(submission.description
        ? { description: submission.description }
        : {}),
    };
    const inputs = {
      ...submission.inputs,
      ...(Object.keys(metadata).length ? { metadata } : {}),
    };

    return this.http.requestJson("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: submission.label ?? "",
        entry_point: submission.entryPoint,
        inputs,
      }),
    }, requestOptions);
  }
}
