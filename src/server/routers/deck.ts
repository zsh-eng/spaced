import { publicProcedure, router } from "@/server/trpc";
import db from "@/db";
import { decks } from "@/schema";
import { z } from "zod";
import { newDeck } from "@/utils/deck";
import { eq } from "drizzle-orm";

export const deckRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    return db.select().from(decks);
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const deck = newDeck(input);
      await db.insert(decks).values(deck);
    }),

  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    await db.delete(decks).where(eq(decks.id, input));
  }),

  edit: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(decks)
        .set({
          name: input.name,
        })
        .where(eq(decks.id, input.id));
    }),
});
