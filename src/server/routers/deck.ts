import db from "@/db";
import {
  User,
  cardContents,
  cards,
  cardsToDecks,
  decks,
  users,
} from "@/schema";
import { MAX_CARDS_TO_FETCH } from "@/server/routers/card";
import { protectedProcedure, router } from "@/server/trpc";
import { newDeck } from "@/utils/deck";
import { success } from "@/utils/format";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, gt, or, sql } from "drizzle-orm";
import { z } from "zod";

const ALL_CARDS = "ALL_CARDS";

export async function checkIfDeckBelongsToUser(
  user: User,
  deckId: string,
): Promise<boolean> {
  // Allow for fetching all decks
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, user.id)),
  });

  return !!deck;
}

export const deckRouter = router({
  all: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

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
      .leftJoin(users, eq(decks.userId, users.id))
      .where(and(eq(users.id, user.id), eq(decks.deleted, false)))
      .groupBy(decks.id)
      .all();
    console.log(success`Fetched ${rows.length} decks`);

    return rows;
  }),

  // See https://trpc.io/docs/client/react/useInfiniteQuery
  infiniteCards: protectedProcedure
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
    .query(async ({ input, ctx }) => {
      const { user } = ctx;
      const { deckId } = input;
      const limit = input.limit ?? MAX_CARDS_TO_FETCH;
      const cursor = input.cursor;

      console.log("Checking if deck exists");
      const isFetchingAllCards = deckId === ALL_CARDS;
      const exists =
        isFetchingAllCards ||
        !!(await db.query.decks.findFirst({
          columns: { id: true },
          where: and(
            eq(decks.id, deckId),
            eq(decks.deleted, false),
            eq(decks.userId, user.id),
          ),
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
        .leftJoin(users, eq(cards.userId, users.id))
        .where(
          and(
            eq(users.id, user.id),
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

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      console.log("Creating deck");
      const deck = newDeck(user.id, input);
      await db.insert(decks).values(deck);
      console.log(success`Created deck ${deck.id}`);
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: deckId }) => {
      const { user } = ctx;
      const belongsToUser = await checkIfDeckBelongsToUser(user, deckId);

      if (!belongsToUser) {
        throw new TRPCError({
          message: "Deck not found",
          code: "NOT_FOUND",
        });
      }

      console.log("Deleting deck", deckId);
      await db.delete(decks).where(eq(decks.id, deckId));
      console.log(success`Deleted deck ${deckId}`);
    }),

  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const belongsToUser = await checkIfDeckBelongsToUser(user, input.id);
      if (!belongsToUser) {
        throw new TRPCError({
          message: "Deck not found",
          code: "NOT_FOUND",
        });
      }

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
