import { cardRouter } from '@/server/routers/card';
import { router, publicProcedure } from '@/server/trpc';
import { success } from '@/utils/format';
import { z } from 'zod';

// See https://trpc.io/docs/quickstart#1-create-a-router-instance

export const appRouter = router({
  hello: publicProcedure.input(z.string()).query(async (opts) => {
    console.log(success`Hello, ${opts.input}!`);
    const { input } = opts;
    return `Hello, ${input}!`;
  }),
  card: cardRouter,
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
