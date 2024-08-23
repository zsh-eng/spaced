import { auth } from "@/auth";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { z } from "zod";
import { User, userRoles } from "@/schema";

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
export function createContextInner(opts?: CreateInnerContextOptions) {
  // For now, we don't have any inner context
  return {};
}

const userSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string(),
  image: z.string().nullable(),
  role: z.enum(userRoles)
});

/**
 * Outer context. Used in the routers and will e.g. bring `req` & `res` to the context as "not `undefined`".
 *
 * @link https://trpc.io/docs/v11/context#inner-and-outer-context
 */
export async function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions) {
  const contextInner = createContextInner({});
  const session = await auth();
  const user: User | undefined = userSchema.optional().parse(session?.user);

  return {
    ...contextInner,
    req,
    resHeaders,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
