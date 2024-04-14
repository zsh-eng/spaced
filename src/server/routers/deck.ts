import { publicProcedure, router } from "@/server/trpc";
import db from "@/db";
import { cardsToDecks, decks } from "@/schema";
import { z } from "zod";
import { newDeck } from "@/utils/deck";
import { eq, sql } from "drizzle-orm";
import { success } from "@/utils/format";

export const deckRouter = router({
  all: publicProcedure.query(async ({}) => {
    console.log("Fetching decks");
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
    console.log(success`Fetched ${rows.length} decks`);

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
      console.log("Creating deck");
      const deck = newDeck(input);
      await db.insert(decks).values(deck);
      console.log(success`Created deck ${deck.id}`);
    }),

  delete: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    console.log("Deleting deck", input);
    await db.delete(decks).where(eq(decks.id, input));
    console.log(success`Deleted deck ${input}`);
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
      console.log("Editing deck", input.id);
      await db
        .update(decks)
        .set({
          name: input.name,
          description: input.description ?? "",
        })
        .where(eq(decks.id, input.id));
      console.log(success`Edited deck ${input.id}`);
    }),
});
