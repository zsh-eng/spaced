import { Context } from '@/server/context';
import { initTRPC } from '@trpc/server';

// See https://trpc.io/docs/quickstart#1-create-a-router-instance

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
