import { publicProcedure, router } from "@/server/trpc";
import db from "@/db";
import { cardsToDecks, decks } from "@/schema";
import { z } from "zod";
import { newDeck } from "@/utils/deck";
import { eq, sql } from "drizzle-orm";

export const deckRouter = router({
  all: publicProcedure.query(async ({}) => {
    const rows = await db
      .select({
        id: decks.id,
        name: decks.name,
        description: decks.description,
        cardCount: sql`count(${cardsToDecks.cardId})`.mapWith(Number),
      })
      .from(decks)
      .leftJoin(cardsToDecks, eq(cardsToDecks.deckId, decks.id))
      .groupBy(decks.id)
      .all();

    return rows;
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
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
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(decks)
        .set({
          name: input.name,
          description: input.description ?? "",
        })
        .where(eq(decks.id, input.id));
    }),
});
