import type { AiidaHttpClient } from "./types";
import type { RequestOptions } from "./types/config";
import type { ServerClient, ServerEndpoints, ServerInfo } from "./types/server";

export class ServerClientImpl implements ServerClient {
  constructor(private readonly http: AiidaHttpClient) {}

  info(requestOptions?: RequestOptions): Promise<ServerInfo> {
    return this.http.requestJson(
      "/server/info",
      { method: "GET" },
      requestOptions,
    );
  }

  endpoints(requestOptions?: RequestOptions): Promise<ServerEndpoints> {
    return this.http.requestJson(
      "/server/endpoints",
      { method: "GET" },
      requestOptions,
    );
  }

  async endpointsTable(requestOptions?: RequestOptions): Promise<string> {
    const response = await this.http.requestBlob(
      "/server/endpoints/table",
      { method: "GET" },
      requestOptions,
    );
    return response.text();
  }
}
