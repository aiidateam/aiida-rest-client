import type { RequestOptions } from "./config";

export interface ServerInfo {
  api_major_version: string;
  api_minor_version: string;
  api_revision_version: string;
  api_prefix: string;
  aiida_version: string;
}

export interface ServerEndpoint {
  path: string;
  group: string | null;
  methods: string[];
  description: string;
}

export interface ServerEndpoints {
  endpoints: ServerEndpoint[];
}

export interface ServerClient {
  info(requestOptions?: RequestOptions): Promise<ServerInfo>;
  endpoints(requestOptions?: RequestOptions): Promise<ServerEndpoints>;
  endpointsTable(requestOptions?: RequestOptions): Promise<string>;
}
