import {
  ALL_CARDS_DECK_ID,
  MAX_CARDS_TO_FETCH,
  MAX_DATE,
  NO_DECK_ID,
} from "@/common";
import db from "@/db";
import {
  User,
  cardContents,
  cards,
  cardsToDecks,
  decks,
  users,
} from "@/schema";
import { protectedProcedure, router } from "@/server/trpc";
import { newDeck } from "@/utils/deck";
import { success } from "@/utils/format";
import { TRPCError } from "@trpc/server";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  inArray,
  isNull,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";

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

    return [
      ...rows,
      {
        id: NO_DECK_ID,
        name: "No Deck",
        cardCount: NaN,
        description: "Cards that are not in any deck",
        createdAt: new Date(),
      },
      {
        id: ALL_CARDS_DECK_ID,
        name: "All Cards",
        cardCount: NaN,
        description: "All cards in all decks",
        createdAt: new Date(),
      },
    ];
  }),

  // See https://trpc.io/docs/client/react/useInfiniteQuery
  infiniteCards: protectedProcedure
    .input(
      z.object({
        deckId: z.string().optional().default(ALL_CARDS_DECK_ID),
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
      const isFetchingAllCards = deckId === ALL_CARDS_DECK_ID;
      const isFetchingCardsWithNoDeck = deckId === NO_DECK_ID;

      const exists =
        isFetchingAllCards ||
        isFetchingCardsWithNoDeck ||
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
            suspended: cards.suspended,
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
            isFetchingAllCards
              ? undefined
              : isFetchingCardsWithNoDeck
                ? isNull(cardsToDecks.deckId)
                : eq(cardsToDecks.deckId, deckId),
            eq(cards.deleted, false),
            eq(cardContents.deleted, false),
            cursor
              ? or(
                  lt(cards.createdAt, cursor.createdAt),
                  and(
                    eq(cards.createdAt, cursor.createdAt),
                    gt(cards.id, cursor.id),
                  ),
                )
              : undefined,
          ),
        )
        .limit(limit)
        .orderBy(desc(cards.createdAt), asc(cards.id));

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
    .input(
      z.object({
        deckId: z.string(),
        deleteCards: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { deckId, deleteCards } = input;
      const { user } = ctx;
      const belongsToUser = await checkIfDeckBelongsToUser(user, deckId);

      if (!belongsToUser) {
        throw new TRPCError({
          message: "Deck not found",
          code: "NOT_FOUND",
        });
      }

      // We leave the card to deck relations around - there's no need to delete them
      // since we can tell if something is deleted based on the foreign key object.

      // TODO: this should be a transaction
      if (deleteCards) {
        console.log("Deleting cards for deck", deckId);
        try {
          const subquery = db
            .select({
              id: cardsToDecks.cardId,
            })
            .from(cardsToDecks)
            .where(eq(cardsToDecks.deckId, deckId));
          const numCards = await db
            .update(cards)
            .set({
              deleted: true,
            })
            .where(inArray(cards.id, sql`(${subquery})`))
            .returning({
              id: cards.id,
            });
          console.log(
            success`Deleted ${numCards.length} cards for deck ${deckId}`,
          );
        } catch (e) {
          console.error(e);
          throw e;
        }
      }

      console.log("Deleting deck", deckId);
      await db
        .update(decks)
        .set({
          deleted: true,
        })
        .where(eq(decks.id, deckId));
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
  pause: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        pause: z.boolean().optional().default(true),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Put the cards in a deck on pause
      const { user } = ctx;
      const belongsToUser = await checkIfDeckBelongsToUser(user, input.id);
      if (!belongsToUser) {
        throw new TRPCError({
          message: "Deck not found",
          code: "NOT_FOUND",
        });
      }

      const { id: deckId, pause } = input;
      const subquery = db
        .select({
          id: cardsToDecks.cardId,
        })
        .from(cardsToDecks)
        .where(eq(cardsToDecks.deckId, deckId));

      if (pause) {
        console.log("Pausing deck", input.id);
        await db
          .update(cards)
          .set({
            suspended: MAX_DATE,
          })
          .where(inArray(cards.id, sql`(${subquery})`));
        console.log(success`Paused deck ${input.id}`);
      } else {
        console.log("Unpausing deck", input.id);
        await db
          .update(cards)
          .set({
            suspended: new Date(),
          })
          .where(inArray(cards.id, sql`(${subquery})`));
        console.log(success`Unpaused deck ${input.id}`);
      }
    }),
});
