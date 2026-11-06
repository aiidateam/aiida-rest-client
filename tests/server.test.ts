import { afterEach, describe, expect, test, vi } from "vitest";

import { createAiidaRestClient } from "../src";

describe("AiidaRestClient server", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("reads server info and endpoint descriptions", async () => {
    const requestUrls: string[] = [];
    const fetchMock = vi.fn().mockImplementation((input: string) => {
      const url = new URL(input);
      requestUrls.push(`${url.pathname}${url.search}`);
      if (url.pathname === "/v0/server/endpoints/table") {
        return new Response("<table></table>", {
          status: 200,
          headers: { "content-type": "text/html" },
        });
      }

      const payload =
        url.pathname === "/v0/server/info"
          ? {
              api_major_version: "0",
              api_minor_version: "1",
              api_revision_version: "0",
              api_prefix: "/v0",
              aiida_version: "2.9.4",
            }
          : { endpoints: [] };
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const client = createAiidaRestClient({
      baseUrl: "https://api.example.org",
    });

    await expect(client.server.info()).resolves.toMatchObject({
      api_prefix: "/v0",
    });
    await expect(client.server.endpoints()).resolves.toEqual({ endpoints: [] });
    await expect(client.server.endpointsTable()).resolves.toBe(
      "<table></table>",
    );

    expect(requestUrls).toEqual([
      "/v0/server/info",
      "/v0/server/endpoints",
      "/v0/server/endpoints/table",
    ]);
  });
});
