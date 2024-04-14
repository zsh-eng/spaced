import { Context } from "@/server/context";
import { initTRPC } from "@trpc/server";
import { transformer } from '@/utils/trpc';

// See https://trpc.io/docs/quickstart#1-create-a-router-instance

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer,
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
