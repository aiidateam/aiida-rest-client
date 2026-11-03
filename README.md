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
});

const status = await client.daemon.status();
const workers = await client.daemon.workers();
```

Runtime values are exported from `aiida-rest-client`; public TypeScript types
are exported from `aiida-rest-client/types`.

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

Repository-content and node-download methods return a browser `Blob`; the
remaining methods follow the response shapes of the AiiDA REST API nodes
read router.

### Processes

- `client.processes.submit({ entryPoint, inputs, label, description })`

Submission uses the REST API's `/submit` endpoint. Node references in `inputs`
use AiiDA REST API keys ending in `.uuid`, for example
`{ "structure.uuid": "<uuid>" }`. The client places label and description in
the process metadata as well as serializing the endpoint's top-level label.
