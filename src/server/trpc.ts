import { Context } from "@/server/context";
import { TRPCError, initTRPC } from "@trpc/server";
import { transformer } from "@/utils/trpc";

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

export const isAuthenticatedMiddleware = t.middleware(
  async function isAuthed(opts) {
    const { ctx } = opts;
    if (!ctx.user) {
      //     ^?
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    if (!ctx.user.id) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User is missing an ID",
      });
    }

    return opts.next({
      ctx: {
        user: ctx.user,
        // ^?
      },
    });
  },
);

export const isPremiumOrAdminMiddleware = t.middleware(
  async function isPremium(opts) {
    const { ctx } = opts;
    if (!["premium", "admin"].includes(ctx?.user?.role ?? "not-user")) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return opts.next(opts);
  },
);

// See https://trpc.io/docs/server/authorization#option-2-authorize-using-middleware
export const protectedProcedure = t.procedure.use(isAuthenticatedMiddleware);

export const premiumProcedure = t.procedure
  .use(isAuthenticatedMiddleware)
  .use(isPremiumOrAdminMiddleware);
