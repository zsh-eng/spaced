import { router, publicProcedure } from '@/server/trpc';
import { z } from 'zod';

// See https://trpc.io/docs/quickstart#1-create-a-router-instance

export const appRouter = router({
  hello: publicProcedure.input(z.string()).query(async (opts) => {
    const { input } = opts;
    return `Hello, ${input}!`;
  }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
