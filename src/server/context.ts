import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  const user = { name: req.headers.get('username') ?? 'anonymous' };
  return { req, resHeaders, user };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
