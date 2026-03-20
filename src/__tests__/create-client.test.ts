import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '../create-client';
import { ApiError } from '../mutator/custom-fetch';

const BASE_URL = 'https://test.example.com';

function makeResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchSpy = vi.fn().mockImplementation(() => Promise.resolve(makeResponse({ ok: true })));
  vi.stubGlobal('fetch', fetchSpy);
});

afterEach(() => vi.unstubAllGlobals());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lastCall() {
  return fetchSpy.mock.calls[fetchSpy.mock.calls.length - 1] as [string, RequestInit];
}

function lastUrl() {
  return lastCall()[0];
}

function lastOptions() {
  return lastCall()[1];
}

function lastHeaders(): Record<string, string> {
  return (lastOptions().headers ?? {}) as Record<string, string>;
}

// ---------------------------------------------------------------------------
// GET no-params  (fn.length = 1): getApiAlphaSite(options?)
// ---------------------------------------------------------------------------

describe('getApiAlphaSite — GET, no params', () => {
  it('forwards default headers', async () => {
    const client = createClient(BASE_URL, {
      headers: { Authorization: 'Bearer tok' },
    });
    await client.getApiAlphaSite();
    expect(lastHeaders()['Authorization']).toBe('Bearer tok');
  });

  it('merges per-call headers on top of defaults (per-call wins)', async () => {
    const client = createClient(BASE_URL, {
      headers: { Authorization: 'Bearer default', 'X-Custom': 'base' },
    });
    await client.getApiAlphaSite({ headers: { Authorization: 'Bearer override' } });
    expect(lastHeaders()['Authorization']).toBe('Bearer override');
    expect(lastHeaders()['X-Custom']).toBe('base');
  });

  it('forwards default RequestInit options (e.g. cache)', async () => {
    const client = createClient(BASE_URL, { cache: 'no-store' });
    await client.getApiAlphaSite();
    expect(lastOptions().cache).toBe('no-store');
  });

  it('per-call RequestInit options override defaults', async () => {
    const client = createClient(BASE_URL, { cache: 'no-store' });
    await client.getApiAlphaSite({ cache: 'force-cache' });
    expect(lastOptions().cache).toBe('force-cache');
  });

  it('prepends baseUrl to the path', async () => {
    const client = createClient(BASE_URL);
    await client.getApiAlphaSite();
    expect(lastUrl()).toBe(`${BASE_URL}/api/alpha/site`);
  });
});

// ---------------------------------------------------------------------------
// GET optional-params  (fn.length = 2): getApiAlphaPostList(params?, options?)
// ---------------------------------------------------------------------------

describe('getApiAlphaPostList — GET, optional params', () => {
  it('forwards default headers when params are provided', async () => {
    const client = createClient(BASE_URL, {
      headers: { Authorization: 'Bearer tok' },
    });
    await client.getApiAlphaPostList({ page: 1 });
    expect(lastHeaders()['Authorization']).toBe('Bearer tok');
  });

  it('forwards default headers when params are omitted', async () => {
    const client = createClient(BASE_URL, {
      headers: { Authorization: 'Bearer tok' },
    });
    await client.getApiAlphaPostList();
    expect(lastHeaders()['Authorization']).toBe('Bearer tok');
  });

  it('merges per-call headers (options as second arg)', async () => {
    const client = createClient(BASE_URL, {
      headers: { Authorization: 'Bearer default' },
    });
    await client.getApiAlphaPostList(
      { page: 1 },
      { headers: { Authorization: 'Bearer override' } },
    );
    expect(lastHeaders()['Authorization']).toBe('Bearer override');
  });

  it('constructs correct URL with query params', async () => {
    const client = createClient(BASE_URL);
    await client.getApiAlphaPostList({ page: 2 });
    expect(lastUrl()).toContain(`${BASE_URL}/api/alpha/post/list`);
    expect(lastUrl()).toContain('page=2');
  });
});

// ---------------------------------------------------------------------------
// GET required-params  (fn.length = 2): getApiAlphaPost(params, options?)
// ---------------------------------------------------------------------------

describe('getApiAlphaPost — GET, required params', () => {
  const params = { id: 42 };

  it('forwards default headers', async () => {
    const client = createClient(BASE_URL, {
      headers: { Authorization: 'Bearer tok' },
    });
    await client.getApiAlphaPost(params);
    expect(lastHeaders()['Authorization']).toBe('Bearer tok');
  });

  it('merges per-call headers', async () => {
    const client = createClient(BASE_URL, {
      headers: { Authorization: 'Bearer default' },
    });
    await client.getApiAlphaPost(params, { headers: { Authorization: 'Bearer override' } });
    expect(lastHeaders()['Authorization']).toBe('Bearer override');
  });

  it('forwards default cache option', async () => {
    const client = createClient(BASE_URL, { cache: 'no-store' });
    await client.getApiAlphaPost(params);
    expect(lastOptions().cache).toBe('no-store');
  });
});

// ---------------------------------------------------------------------------
// POST required-body  (fn.length = 2): postApiAlphaSiteBlock(body, options?)
// ---------------------------------------------------------------------------

describe('postApiAlphaSiteBlock — POST, required body', () => {
  const body = { instance: 'spam.example.com', block: true };

  it('sends the body correctly (not corrupted)', async () => {
    const client = createClient(BASE_URL);
    await client.postApiAlphaSiteBlock(body);
    expect(lastOptions().body).toBe(JSON.stringify(body));
  });

  it('forwards default headers alongside Content-Type', async () => {
    const client = createClient(BASE_URL, {
      headers: { Authorization: 'Bearer tok' },
    });
    await client.postApiAlphaSiteBlock(body);
    expect(lastHeaders()['Authorization']).toBe('Bearer tok');
    expect(lastHeaders()['Content-Type']).toBe('application/json');
  });

  it('merges per-call headers without losing body', async () => {
    const client = createClient(BASE_URL, {
      headers: { Authorization: 'Bearer default' },
    });
    await client.postApiAlphaSiteBlock(body, {
      headers: { Authorization: 'Bearer override' },
    });
    expect(lastHeaders()['Authorization']).toBe('Bearer override');
    expect(lastOptions().body).toBe(JSON.stringify(body));
  });

  it('uses POST method', async () => {
    const client = createClient(BASE_URL);
    await client.postApiAlphaSiteBlock(body);
    expect(lastOptions().method).toBe('POST');
  });
});

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

describe('ApiError', () => {
  it('throws ApiError with correct status and data on 4xx', async () => {
    fetchSpy.mockImplementation(() => Promise.resolve(makeResponse({ error: 'not found' }, 404)));
    const client = createClient(BASE_URL);

    await expect(client.getApiAlphaSite()).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      data: { error: 'not found' },
    });
  });

  it('throws ApiError on 5xx', async () => {
    fetchSpy.mockImplementation(() => Promise.resolve(makeResponse({ error: 'server error' }, 500)));
    const client = createClient(BASE_URL);

    const err = await client.getApiAlphaSite().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(500);
  });

  it('throws ApiError (not SyntaxError) when response body is non-JSON', async () => {
    fetchSpy.mockImplementation(() =>
      Promise.resolve(new Response('<html>Gateway Timeout</html>', { status: 504 })),
    );
    const client = createClient(BASE_URL);

    const err = await client.getApiAlphaSite().catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(504);
    expect(err.data).toBe('<html>Gateway Timeout</html>');
  });

  it('returns parsed JSON on success', async () => {
    fetchSpy.mockImplementation(() =>
      Promise.resolve(new Response('not json', { status: 200 })),
    );
    const client = createClient(BASE_URL);

    const result = await client.getApiAlphaSite();
    expect(result).toBe('not json');
  });
});

// ---------------------------------------------------------------------------
// AbortController
// ---------------------------------------------------------------------------

describe('AbortController', () => {
  it('forwards signal to fetch', async () => {
    const controller = new AbortController();
    const client = createClient(BASE_URL);
    await client.getApiAlphaSite({ signal: controller.signal });
    expect(lastOptions().signal).toBe(controller.signal);
  });

  it('propagates abort error when signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    fetchSpy.mockImplementation((_url: string, opts: RequestInit) => {
      if (opts.signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
      return Promise.resolve(makeResponse({ ok: true }));
    });
    const client = createClient(BASE_URL);
    const err = await client.getApiAlphaSite({ signal: controller.signal }).catch((e) => e);
    expect(err.name).toBe('AbortError');
  });
});

// ---------------------------------------------------------------------------
// baseUrl
// ---------------------------------------------------------------------------

describe('baseUrl construction', () => {
  it('trims trailing slash from baseUrl', async () => {
    const client = createClient('https://test.example.com/');
    await client.getApiAlphaSite();
    expect(lastUrl()).toBe('https://test.example.com/api/alpha/site');
  });

  it('different clients use their own baseUrl', async () => {
    const a = createClient('https://instance-a.com');
    const b = createClient('https://instance-b.com');

    await a.getApiAlphaSite();
    const urlA = lastUrl();

    await b.getApiAlphaSite();
    const urlB = lastUrl();

    expect(urlA).toBe('https://instance-a.com/api/alpha/site');
    expect(urlB).toBe('https://instance-b.com/api/alpha/site');
  });
});
