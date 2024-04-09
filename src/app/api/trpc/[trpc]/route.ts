import { createContext } from '@/server/context';
import { appRouter } from '@/server/routers/_app';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

// See https://trpc.io/docs/server/adapters/nextjs#route-handlers

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
