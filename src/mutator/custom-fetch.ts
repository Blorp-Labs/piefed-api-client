// Augment RequestInit so callers can pass baseUrl per-request
// without needing a cast.
declare global {
  interface RequestInit {
    /** Override the API base URL for this specific request. */
    baseUrl?: string;
  }
}

let _defaultBaseUrl = 'https://piefed.social';

export function configure(options: { baseUrl: string }) {
  _defaultBaseUrl = options.baseUrl.replace(/\/$/, '');
}

export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const { baseUrl = _defaultBaseUrl, ...fetchOptions } = options ?? {};
  const base = baseUrl.replace(/\/$/, '');

  const res = await fetch(`${base}${url}`, fetchOptions);
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return { data, status: res.status, headers: res.headers } as T;
};
