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

/**
 * Create a client bound to a specific PieFed instance.
 *
 * @example
 * const client = createClient('https://piefed.social');
 * const site = await client.getApiAlphaSite();
 *
 * // Two instances at the same time:
 * const a = createClient('https://instance-a.com');
 * const b = createClient('https://instance-b.com');
 */
export function createClient(baseUrl: string): ApiFunctions {
  const boundFns = {} as Record<string, AsyncFn>;

  for (const [key, fn] of Object.entries(allFns)) {
    if (typeof fn !== 'function') continue;

    boundFns[key] = (...args: unknown[]) => {
      // options is always the last argument; inject baseUrl into it
      const last = args[args.length - 1];
      if (last !== null && typeof last === 'object' && !Array.isArray(last)) {
        args[args.length - 1] = { ...last as object, baseUrl };
      } else if (last === undefined || args.length === 0) {
        // either no args or options was explicitly undefined
        if (args.length > 0) {
          args[args.length - 1] = { baseUrl };
        } else {
          args.push({ baseUrl });
        }
      } else {
        // last arg is a non-options value (e.g. a body object) — append options
        args.push({ baseUrl });
      }
      return (fn as AsyncFn)(...args);
    };
  }

  return boundFns as ApiFunctions;
}
