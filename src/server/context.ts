import db from '@/db';
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

// See https://trpc.io/docs/server/context#inner-and-outer-context

/**
 * Defines your inner context shape.
 * Add fields here that the inner context brings.
 */
export interface CreateInnerContextOptions
  extends Partial<FetchCreateContextFnOptions> {}

/**
 * Inner context. Will always be available in your procedures, in contrast to the outer context.
 *
 * Also useful for:
 * - testing, so you don't have to mock Next.js' `req`/`res`
 * - tRPC's `createServerSideHelpers` where we don't have `req`/`res`
 *
 * @link https://trpc.io/docs/v11/context#inner-and-outer-context
 */
export async function createContextInner(opts?: CreateInnerContextOptions) {
  // Provide the database to the inner context
  return {
    db,
  };
}

/**
 * Outer context. Used in the routers and will e.g. bring `req` & `res` to the context as "not `undefined`".
 *
 * @link https://trpc.io/docs/v11/context#inner-and-outer-context
 */
export function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  const contextInner = createContextInner({});
  return {
    ...contextInner,
    req,
    resHeaders,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;
