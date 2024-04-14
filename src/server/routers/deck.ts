import { publicProcedure, router } from "@/server/trpc";
import db from "@/db";
import { cardContents, cards, cardsToDecks, decks } from "@/schema";
import { z } from "zod";
import { newDeck } from "@/utils/deck";
import { and, asc, eq, gt, or, sql } from "drizzle-orm";
import { success } from "@/utils/format";
import { MAX_CARDS_TO_FETCH } from "@/server/routers/card";
import { TRPCError } from "@trpc/server";

const ALL_CARDS = "ALL_CARDS";

export const deckRouter = router({
  all: publicProcedure.query(async ({}) => {
    console.log("Fetching decks");
    const rows = await db
      .select({
        id: decks.id,
        name: decks.name,
        description: decks.description,
        cardCount: sql`count(${cardsToDecks.cardId})`.mapWith(Number),
        createdAt: decks.createdAt,
      })
      .from(decks)
      .leftJoin(cardsToDecks, eq(cardsToDecks.deckId, decks.id))
      .groupBy(decks.id)
      .all();
    console.log(success`Fetched ${rows.length} decks`);

    return rows;
  }),

  // See https://trpc.io/docs/client/react/useInfiniteQuery
  infiniteCards: publicProcedure
    .input(
      z.object({
        deckId: z.string().uuid().optional().default(ALL_CARDS),
        limit: z.number().min(1).max(MAX_CARDS_TO_FETCH).nullish(),
        cursor: z
          .object({
            createdAt: z.date(),
            id: z.string().uuid(),
          })
          .nullish(),
      }),
    )
    .query(async ({ input }) => {
      const { deckId } = input;
      const limit = input.limit ?? MAX_CARDS_TO_FETCH;
      const cursor = input.cursor;

      console.log("Checking if deck exists");
      const isFetchingAllCards = deckId === ALL_CARDS;
      const exists =
        isFetchingAllCards ||
        !!(await db.query.decks.findFirst({
          columns: { id: true },
          where: and(eq(decks.id, deckId), eq(decks.deleted, false)),
        }));

      if (!exists) {
        throw new TRPCError({
          message: "Deck not found",
          code: "NOT_FOUND",
        });
      }
      console.log(success`Deck ${deckId} exists`);

      console.log("Fetching cards for deck", deckId);
      // Cursor-based pagination
      // https://orm.drizzle.team/learn/guides/cursor-based-pagination
      const cardsWithDeck = await db
        .select({
          cards: {
            id: cards.id,
            createdAt: cards.createdAt,
            state: cards.state,
          },
          cardContents: {
            id: cardContents.id,
            question: cardContents.question,
            answer: cardContents.answer,
            createdAt: cardContents.createdAt,
          },
        })
        .from(cards)
        .leftJoin(cardsToDecks, eq(cardsToDecks.cardId, cards.id))
        .leftJoin(cardContents, eq(cardContents.cardId, cards.id))
        .where(
          and(
            isFetchingAllCards ? undefined : eq(cardsToDecks.deckId, deckId),
            eq(cards.deleted, false),
            eq(cardContents.deleted, false),
            cursor
              ? or(
                  gt(cards.createdAt, cursor.createdAt),
                  and(
                    eq(cards.createdAt, cursor.createdAt),
                    gt(cards.id, cursor.id),
                  ),
                )
              : undefined,
          ),
        )
        .limit(limit)
        .orderBy(asc(cards.createdAt), asc(cards.id));

      console.log(success`Fetched deck ${deckId}`);
      const lastItem = cardsWithDeck[cardsWithDeck.length - 1];
      if (!lastItem || cardsWithDeck.length < limit) {
        return {
          data: cardsWithDeck,
          cursor: undefined,
        };
      }

      const nextCursor = {
        id: lastItem.cards.id,
        createdAt: lastItem.cards.createdAt,
      };

      return {
        data: cardsWithDeck,
        nextCursor,
      };
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
