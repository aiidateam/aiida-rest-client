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

const client = createAiidaRestClient({
  baseUrl: "http://127.0.0.1:8000",
  apiPrefix: "/v0",
});

const status = await client.daemon.status();
const workers = await client.daemon.workers();
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
