import { createContext } from '@/server/context';
import { AppRouter, appRouter } from '@/server/routers/_app';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export const dynamic = 'force-dynamic';

// See https://trpc.io/docs/server/adapters/nextjs#route-handlers
const handler = (req: Request) =>
  fetchRequestHandler<AppRouter>({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
