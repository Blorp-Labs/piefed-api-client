// Augment RequestInit so callers can pass baseUrl per-request
// without needing a cast.
declare global {
  interface RequestInit {
    /** Override the API base URL for this specific request. */
    baseUrl?: string;
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: unknown,
  ) {
    super(`API error ${status}`);
    this.name = 'ApiError';
  }
}

export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const { baseUrl, ...fetchOptions } = options ?? {};
  if (!baseUrl) throw new Error('baseUrl is required — use createClient() to make requests');
  const base = baseUrl.replace(/\/$/, '');

  const res = await fetch(`${base}${url}`, fetchOptions);
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data as T;
};
