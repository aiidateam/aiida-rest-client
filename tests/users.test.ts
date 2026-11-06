import { afterEach, describe, expect, test, vi } from "vitest";

import { createAiidaRestClient } from "../src";

describe("AiidaRestClient users", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("routes user read endpoints", async () => {
    const requestUrls: string[] = [];
    const fetchMock = vi.fn().mockImplementation((input: string) => {
      const url = new URL(input);
      requestUrls.push(`${url.pathname}${url.search}`);
      const payload = url.pathname.endsWith("/schema")
        ? { properties: {} }
        : url.pathname.endsWith("/projections")
          ? ["email"]
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

    await client.users.schema();
    await client.users.projections();
    await client.users.list({ pageSize: 3 });
    await client.users.get(4, ["groups"]);

    expect(requestUrls).toEqual([
      "/v0/users/schema",
      "/v0/users/projections",
      "/v0/users?page_size=3",
      "/v0/users/4?include=groups",
    ]);
  });
});
