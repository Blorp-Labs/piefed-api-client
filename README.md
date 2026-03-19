# piefed-api-client

Typed TypeScript client for the [PieFed](https://piefed.social) API, automatically generated from the [OpenAPI spec](https://piefed.social/api/alpha/swagger.json).

Includes:
- TypeScript interfaces/types (`src/schemas/`)
- Native `fetch`-based API functions (`src/client/`)
- Zod validation schemas (`src/zod/`)

## Installation

```sh
pnpm add @blorp-labs/piefed-api-client
```

## Usage

### Basic

```ts
import { createClient } from '@blorp-labs/piefed-api-client';

const client = createClient('https://piefed.social');
const site = await client.getApiAlphaSite();
```

### With authentication

```ts
const client = createClient('https://piefed.social', {
  headers: { Authorization: 'Bearer <token>' },
});
```

### With default fetch options

Any [`RequestInit`](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit) option (except `body` and `method`) can be set as a default:

```ts
const client = createClient('https://piefed.social', {
  cache: 'no-store',
  headers: { Authorization: 'Bearer <token>' },
});
```

Per-call options override the defaults; headers are merged.

### Multiple instances

```ts
const a = createClient('https://instance-a.com');
const b = createClient('https://instance-b.com');
```

### Error handling

Errors throw an `ApiError` with `.status` and `.data`:

```ts
import { createClient, ApiError } from '@blorp-labs/piefed-api-client';

try {
  const site = await client.getApiAlphaSite();
} catch (e) {
  if (e instanceof ApiError) {
    console.error(e.status, e.data);
  }
}
```

### Zod schemas

Zod schemas are exported from the `/zod` subpath:

```ts
import { getApiAlphaSiteQueryParams } from '@blorp-labs/piefed-api-client/zod';
```

## Development

Requires [corepack](https://nodejs.org/api/corepack.html) (ships with Node 16+).

```sh
corepack enable
pnpm install
pnpm generate   # regenerate src/ from OpenAPI spec
pnpm build      # compile TypeScript → dist/
```

## Automation

A GitHub Actions workflow triggers on every push to `main`. It:
1. Regenerates `src/` from the live OpenAPI spec
2. Sets the version to `0.0.0-{commit-sha}`
3. Builds and publishes to npm
