import { afterEach, describe, expect, test, vi } from "vitest";

import { createAiidaRestClient } from "../src";

describe("AiidaRestClient computers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("routes computer read endpoints", async () => {
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

    await client.computers.schema();
    await client.computers.schema({ which: "write" });
    await client.computers.projections();
    await client.computers.list({ pageSize: 2 });
    await client.computers.get("computer-uuid", ["user"]);
    await client.computers.metadata("computer-uuid", ["parent"]);

    expect(requestUrls).toEqual([
      "/v0/computers/schema",
      "/v0/computers/schema?which=write",
      "/v0/computers/projections",
      "/v0/computers?page_size=2",
      "/v0/computers/computer-uuid?include=user",
      "/v0/computers/computer-uuid/metadata?include=parent",
    ]);
  });
});
