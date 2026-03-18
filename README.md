# piefed-api-client

Typed TypeScript client for the [PieFed](https://piefed.social) API, automatically generated from the [OpenAPI spec](https://piefed.social/api/alpha/swagger.json).

Includes:
- TypeScript interfaces/types (`src/schemas/`)
- Native `fetch`-based API functions (`src/client/`)
- Zod validation schemas (`src/zod/`)

## Installation

```sh
# .npmrc — point @blorp-labs scope to GitHub Packages
echo "@blorp-labs:registry=https://npm.pkg.github.com" >> .npmrc

pnpm add @blorp-labs/piefed-api-client
```

## Usage

```ts
import { getCommunity, GetCommunityParams } from '@blorp-labs/piefed-api-client';

const community = await getCommunity({ id: 123 });
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

A GitHub Actions workflow runs daily and on `workflow_dispatch`. If the OpenAPI spec has changed, it:
1. Regenerates `src/`
2. Bumps the patch version
3. Commits & tags the change
4. Publishes to GitHub Packages
