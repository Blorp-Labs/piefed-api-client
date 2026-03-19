import * as admin from './client/admin/admin';
import * as comment from './client/comment/comment';
import * as community from './client/community/community';
import * as feed from './client/feed/feed';
import * as misc from './client/misc/misc';
import * as post from './client/post/post';
import * as privateMessage from './client/private-message/private-message';
import * as site from './client/site/site';
import * as topic from './client/topic/topic';
import * as upload from './client/upload/upload';
import * as user from './client/user/user';

const allFns = {
  ...admin,
  ...comment,
  ...community,
  ...feed,
  ...misc,
  ...post,
  ...privateMessage,
  ...site,
  ...topic,
  ...upload,
  ...user,
};

// Only the async API functions (not URL helpers or type exports)
type AsyncFn = (...args: any[]) => Promise<any>;
type ApiFunctions = {
  [K in keyof typeof allFns as (typeof allFns)[K] extends AsyncFn ? K : never]: (typeof allFns)[K];
};

interface CreateClientOptions extends Omit<RequestInit, 'body' | 'method'> {
  /** Default headers merged into every request (e.g. Authorization). */
  headers?: Record<string, string>;
}

/**
 * Create a client bound to a specific PieFed instance.
 *
 * @example
 * const client = createClient('https://piefed.social');
 * const site = await client.getApiAlphaSite();
 *
 * // With auth:
 * const client = createClient('https://piefed.social', {
 *   headers: { Authorization: 'Bearer <token>' },
 * });
 *
 * // Two instances at the same time:
 * const a = createClient('https://instance-a.com');
 * const b = createClient('https://instance-b.com');
 */
export function createClient(baseUrl: string, options: CreateClientOptions = {}): ApiFunctions {
  const boundFns = {} as Record<string, AsyncFn>;

  for (const [key, fn] of Object.entries(allFns)) {
    if (typeof fn !== 'function') continue;

    // fn.length is the total param count; options is always the last param
    const optionsIndex = (fn as AsyncFn).length - 1;

    boundFns[key] = (...args: unknown[]) => {
      // Pad args so options index is always reachable
      while (args.length <= optionsIndex) args.push(undefined);

      const { headers: defaultHeaders, ...defaultInit } = options;
      const extra: RequestInit & { baseUrl: string } = { ...defaultInit, baseUrl };
      const existing = args[optionsIndex] as (RequestInit & { baseUrl?: string }) | undefined;

      args[optionsIndex] = {
        ...extra,
        ...existing,
        headers: {
          ...defaultHeaders,
          ...(existing?.headers as Record<string, string> | undefined),
        },
      };

      return (fn as AsyncFn)(...args);
    };
  }

  return boundFns as ApiFunctions;
}
