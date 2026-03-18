import { defineConfig } from 'orval';

export default defineConfig({
  piefedClient: {
    input: {
      target: 'https://piefed.social/api/alpha/swagger.json',
    },
    output: {
      target: './src/client',
      schemas: './src/schemas',
      client: 'fetch',
      mode: 'tags-split',
      clean: true,
      override: {
        mutator: {
          path: './src/mutator/custom-fetch.ts',
          name: 'customFetch',
        },
      },
    },
  },
  piefedZod: {
    input: {
      target: 'https://piefed.social/api/alpha/swagger.json',
    },
    output: {
      target: './src/zod',
      client: 'zod',
      mode: 'tags-split',
      clean: true,
    },
  },
});
