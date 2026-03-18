// Configuration and client factory
export { configure, ApiError } from './mutator/custom-fetch';
export { createClient } from './create-client';

// Re-export generated TypeScript types/schemas
export * from './schemas/index';

// Re-export generated fetch client functions (tags-split)
export * from './client/admin/admin';
export * from './client/comment/comment';
export * from './client/community/community';
export * from './client/feed/feed';
export * from './client/misc/misc';
export * from './client/post/post';
export * from './client/private-message/private-message';
export * from './client/site/site';
export * from './client/topic/topic';
export * from './client/upload/upload';
export * from './client/user/user';
