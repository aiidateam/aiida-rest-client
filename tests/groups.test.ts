import { afterEach, describe, expect, test, vi } from "vitest";

import { createAiidaRestClient } from "../src";

describe("AiidaRestClient groups", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("routes group read and related-resource endpoints", async () => {
    const requestUrls: string[] = [];
    const fetchMock = vi.fn().mockImplementation((input: string) => {
      const url = new URL(input);
      requestUrls.push(`${url.pathname}${url.search}`);
      const payload = url.pathname.endsWith("/schema")
        ? { properties: {} }
        : url.pathname.endsWith("/projections")
          ? ["label"]
          : { data: [] };
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/vnd.api+json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const client = createAiidaRestClient({
      baseUrl: "https://api.example.org",
    });

    await client.groups.schema();
    await client.groups.projections();
    await client.groups.list({ pageSize: 5 });
    await client.groups.get("group-uuid", ["user"]);
    await client.groups.user("group-uuid");
    await client.groups.nodes("group-uuid", { pageSize: 7 });
    await client.groups.extras("group-uuid", ["parent"]);

    expect(requestUrls).toEqual([
      "/v0/groups/schema",
      "/v0/groups/projections",
      "/v0/groups?page_size=5",
      "/v0/groups/group-uuid?include=user",
      "/v0/groups/group-uuid/user",
      "/v0/groups/group-uuid/nodes?page_size=7",
      "/v0/groups/group-uuid/extras?include=parent",
    ]);
  });
});
