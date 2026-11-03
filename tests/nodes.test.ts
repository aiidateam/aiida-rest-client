import { afterEach, describe, expect, test, vi } from "vitest";

import { createAiidaRestClient } from "../src";

describe("AiidaRestClient nodes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("lists nodes with JSON filters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "content-type": "application/vnd.api+json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = createAiidaRestClient({
      baseUrl: "https://api.example.org",
    });

    await client.nodes.list({
      filters: { node_type: { "==": "data.core.structure.StructureData." } },
      pageSize: 25,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.org/v0/nodes?filters=%7B%22node_type%22%3A%7B%22%3D%3D%22%3A%22data.core.structure.StructureData.%22%7D%7D&page_size=25",
      expect.objectContaining({ method: "GET" }),
    );
  });

  test("gets node links with a direction", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: "process-uuid:structure-uuid",
              type: "links",
              attributes: {
                link_id: "process-uuid:structure-uuid",
                link_label: "output_structure",
                link_type: "return",
              },
              relationships: {
                target: { data: { id: "structure-uuid", type: "nodes" } },
              },
            },
          ],
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

    const response = await client.nodes.links("node/uuid", "outgoing");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.org/v0/nodes/node%2Fuuid/links?direction=outgoing",
      expect.objectContaining({ method: "GET" }),
    );
    expect(response.data[0].relationships?.target?.data?.id).toBe(
      "structure-uuid",
    );
  });

  test("gets node attributes from the attributes child resource", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: "node-uuid",
            type: "attributes",
            attributes: { cell: [], sites: [] },
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

    await expect(client.nodes.attributes("node-uuid")).resolves.toMatchObject({
      data: { attributes: { cell: [], sites: [] } },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.org/v0/nodes/node-uuid/attributes",
      expect.objectContaining({ method: "GET" }),
    );
  });

  test("covers the nodes read router endpoints", async () => {
    const requestUrls: string[] = [];
    const fetchMock = vi.fn().mockImplementation((input: string) => {
      requestUrls.push(input);
      const binaryResponse =
        input.includes("/repo/contents") || input.includes("/download");
      return new Response(binaryResponse ? "bytes" : JSON.stringify({ data: [] }), {
        status: 200,
        headers: {
          "content-type": binaryResponse
            ? "application/octet-stream"
            : "application/vnd.api+json",
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const client = createAiidaRestClient({ baseUrl: "https://api.example.org" });

    await client.nodes.schema({
      nodeType: "data.core.structure.StructureData.",
      which: "read",
    });
    await client.nodes.projections("data.core.structure.StructureData.");
    await client.nodes.statistics(7);
    await client.nodes.downloadFormats();
    await client.nodes.types();
    await client.nodes.list();
    await client.nodes.get("123");
    await client.nodes.user("123");
    await client.nodes.computer("123");
    await client.nodes.groups("123");
    await client.nodes.attributes("123", ["parent"]);
    await client.nodes.extras("123", ["parent"]);
    await client.nodes.links("123", "incoming");
    await client.nodes.repoMetadata("123", ["parent"]);
    await client.nodes.repoContents("123", "path/structure.json");
    await client.nodes.download("123", "archive", { include: ["groups"] });

    expect(
      requestUrls.map((url) => {
        const parsed = new URL(url);
        return `${parsed.pathname}${parsed.search}`;
      }),
    ).toEqual([
      "/v0/nodes/schema?type=data.core.structure.StructureData.&which=read",
      "/v0/nodes/projections?type=data.core.structure.StructureData.",
      "/v0/nodes/statistics?user=7",
      "/v0/nodes/download_formats",
      "/v0/nodes/types",
      "/v0/nodes",
      "/v0/nodes/123",
      "/v0/nodes/123/user",
      "/v0/nodes/123/computer",
      "/v0/nodes/123/groups",
      "/v0/nodes/123/attributes?include=parent",
      "/v0/nodes/123/extras?include=parent",
      "/v0/nodes/123/links?direction=incoming",
      "/v0/nodes/123/repo/metadata?include=parent",
      "/v0/nodes/123/repo/contents?filename=path%2Fstructure.json",
      "/v0/nodes/123/download?format=archive&options=%7B%22include%22%3A%5B%22groups%22%5D%7D",
    ]);
  });

  test("routes each nodes read operation to its API endpoint", async () => {
    const requestUrls: string[] = [];
    const fetchMock = vi.fn().mockImplementation((input: string) => {
      requestUrls.push(input);
      const binaryResponse =
        input.includes("/repo/contents") || input.includes("/download");
      return new Response(
        binaryResponse ? "file-content" : JSON.stringify({ data: [] }),
        {
          status: 200,
          headers: {
            "content-type": binaryResponse
              ? "application/octet-stream"
              : "application/vnd.api+json",
          },
        },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    const client = createAiidaRestClient({ baseUrl: "https://api.example.org" });

    await client.nodes.schema({
      nodeType: "data.core.structure.StructureData.",
      which: "read",
    });
    await client.nodes.projections("data.core.structure.StructureData.");
    await client.nodes.statistics(7);
    await client.nodes.downloadFormats();
    await client.nodes.types();
    await client.nodes.list();
    await client.nodes.get("123");
    await client.nodes.user("123");
    await client.nodes.computer("123");
    await client.nodes.groups("123");
    await client.nodes.attributes("123", ["parent"]);
    await client.nodes.extras("123", ["parent"]);
    await client.nodes.links("123", "incoming");
    await client.nodes.repoMetadata("123", ["parent"]);
    await client.nodes.repoContents("123", "path/structure.json");
    await client.nodes.download("123", "archive", { include: ["groups"] });

    expect(
      requestUrls.map((url) => {
        const parsed = new URL(url);
        return `${parsed.pathname}${parsed.search}`;
      }),
    ).toEqual([
      "/v0/nodes/schema?type=data.core.structure.StructureData.&which=read",
      "/v0/nodes/projections?type=data.core.structure.StructureData.",
      "/v0/nodes/statistics?user=7",
      "/v0/nodes/download_formats",
      "/v0/nodes/types",
      "/v0/nodes",
      "/v0/nodes/123",
      "/v0/nodes/123/user",
      "/v0/nodes/123/computer",
      "/v0/nodes/123/groups",
      "/v0/nodes/123/attributes?include=parent",
      "/v0/nodes/123/extras?include=parent",
      "/v0/nodes/123/links?direction=incoming",
      "/v0/nodes/123/repo/metadata?include=parent",
      "/v0/nodes/123/repo/contents?filename=path%2Fstructure.json",
      "/v0/nodes/123/download?format=archive&options=%7B%22include%22%3A%5B%22groups%22%5D%7D",
    ]);
  });
});
