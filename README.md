# AiiDA REST Client

A REST Client for the AiiDA REST API.

## Status

This package is currently internal and under active development.

## Quick start

```ts
import { createAiidaRestClient } from "aiida-rest-client";

const client = createAiidaRestClient({
  baseUrl: "http://127.0.0.1:8000",
  apiPrefix: "/v0",
});

const status = await client.daemon.status();
const workers = await client.daemon.worker();
```

## Available daemon methods

- `client.daemon.status()`
- `client.daemon.worker()`
- `client.daemon.start()`
- `client.daemon.stop()`
- `client.daemon.increase()`
- `client.daemon.decrease()`
