import { afterEach, describe, expect, test, vi } from "vitest";

import { createAiidaRestClient } from "../src";

describe("AiidaRestClient processes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("submits a process through the JSON:API endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: "process-uuid",
            type: "nodes",
            attributes: {},
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/vnd.api+json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = createAiidaRestClient({
      baseUrl: "https://api.example.org",
    });
    const requestOptions = {
      timeout: 4_200,
      headers: { "X-Request-ID": "submit-workflow" },
    };

    await expect(
      client.processes.submit({
        entryPoint: "aiida.workflows:aiidalab_qe.app",
        label: "Relax silicon",
        description: "Test submission",
        inputs: { "structure.uuid": "structure-uuid" },
      }, requestOptions),
    ).resolves.toMatchObject({ data: { id: "process-uuid" } });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.org/v0/submit",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Request-ID": "submit-workflow",
        }),
        body: JSON.stringify({
          label: "Relax silicon",
          entry_point: "aiida.workflows:aiidalab_qe.app",
          inputs: {
            "structure.uuid": "structure-uuid",
            metadata: {
              label: "Relax silicon",
              description: "Test submission",
            },
          },
        }),
      }),
    );
  });
});
