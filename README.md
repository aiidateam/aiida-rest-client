# AiiDA REST Client

A REST Client for the AiiDA REST API.

## Status

**🚧 UNDER DEVELOPMENT 🚧**

## Installation

```bash
npm install aiida-rest-client
```

## Usage

```ts
import { createAiidaRestClient } from "aiida-rest-client";
import type { AiidaRestClient } from "aiida-rest-client/types";

const client: AiidaRestClient = createAiidaRestClient({
  baseUrl: "http://127.0.0.1:8000",
  apiPrefix: "/v0",
  timeout: 30_000,
  headers: { "X-Client-Name": "example" },
});

const status = await client.daemon.status({
  timeout: 5_000,
  headers: { "X-Request-ID": "status-check" },
});
const workers = await client.daemon.workers();
```

Runtime values are exported from `aiida-rest-client`; public TypeScript types
are exported from `aiida-rest-client/types`.

Every endpoint accepts an optional `RequestOptions` object as its last
argument. It can override the client-level `timeout` (in milliseconds), set
headers for that request, and provide an `AbortSignal` to cancel it. Client-level
headers are defaults; per-request headers override them, while endpoint-required
headers such as `Content-Type` take precedence. Timeout errors are reported as
HTTP-style 408 `JsonApiError`s; caller cancellation propagates the abort error.

Endpoints that already take arguments keep those arguments first. For example:

```ts
const nodes = await client.nodes.list(
  { filters: { node_type: { "==": "data.core.structure.StructureData." } } },
  { timeout: 10_000 },
);
```

## Available methods

### Daemon

- `client.daemon.status()`
- `client.daemon.workers()`
- `client.daemon.start()`
- `client.daemon.stop()`
- `client.daemon.restart()`
- `client.daemon.increase()`
- `client.daemon.decrease()`

### Nodes

- `client.nodes.schema({ nodeType, which })`
- `client.nodes.projections(nodeType)`
- `client.nodes.statistics(user)`
- `client.nodes.downloadFormats()`
- `client.nodes.types()`
- `client.nodes.list({ filters, orderBy, page, pageSize, offset, include })`
- `client.nodes.get(identifier, include)`
- `client.nodes.user(identifier)`
- `client.nodes.computer(identifier)`
- `client.nodes.groups(identifier, options)`
- `client.nodes.attributes(identifier, include)`
- `client.nodes.extras(identifier, include)`
- `client.nodes.links(identifier, direction, options)`
- `client.nodes.repoMetadata(identifier, include)`
- `client.nodes.repoContents(identifier, filename)`
- `client.nodes.download(identifier, format, options)`
- `client.nodes.create(request)`

Repository-content and node-download methods return a browser `Blob`; the
remaining methods follow the response shapes of the AiiDA REST API nodes
read router.

### Computers

- `client.computers.schema({ which })`
- `client.computers.projections()`
- `client.computers.list(options, requestOptions)`
- `client.computers.get(identifier, include, requestOptions)`
- `client.computers.metadata(identifier, include, requestOptions)`

### Users

- `client.users.schema({ which })`
- `client.users.projections()`
- `client.users.list(options, requestOptions)`
- `client.users.get(identifier, include, requestOptions)`

User identifiers are integer user IDs.

### Groups

- `client.groups.schema({ which })`
- `client.groups.projections()`
- `client.groups.list(options, requestOptions)`
- `client.groups.get(identifier, include, requestOptions)`
- `client.groups.user(identifier)`
- `client.groups.nodes(identifier, options, requestOptions)`
- `client.groups.extras(identifier, include, requestOptions)`

### Server

- `client.server.info()`
- `client.server.endpoints()`
- `client.server.endpointsTable()`

`endpointsTable()` returns the server's HTML endpoint table as a string.

### Processes

- `client.processes.submit({ entryPoint, inputs, label, description })`

Submission uses the REST API's `/submit` endpoint. Node references in `inputs`
use AiiDA REST API keys ending in `.uuid`, for example
`{ "structure.uuid": "<uuid>" }`. The client places label and description in
the process metadata as well as serializing the endpoint's top-level label.
