import db from "@/db";
import { createCardFormSchema, createManyCardsFormSchema } from "@/form";
import {
  NewCardsToDecks,
  cardContents,
  cards,
  cardsToDecks,
  ratings,
  reviewLogs,
  states,
} from "@/schema";
import { publicProcedure, router } from "@/server/trpc";
import { success } from "@/utils/format";
import { gradeCard, newCardWithContent } from "@/utils/fsrs";
import { SessionCard, SessionData, SessionStats } from "@/utils/session";
import { CardSorts } from "@/utils/sort";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, lte, ne, sql } from "drizzle-orm";
import { z } from "zod";

export const MAX_CARDS_TO_FETCH = 50;
export const MAX_LEARN_PER_DAY = 20;

async function getReviewCards(): Promise<SessionCard[]> {
  const now = new Date();

  console.log("Fetching review cards");
  const cardWithContents = await db
    .select()
    .from(cardContents)
    .leftJoin(cards, eq(cardContents.cardId, cards.id))
    .where(
      and(
        // Filter out deleted cards
        eq(cardContents.deleted, false),
        eq(cards.deleted, false),
        // Filter out cards that are not in review state
        ne(cards.state, states[0]),
        // Filter out cards that are not due or suspended
        lte(cards.due, now),
        lte(cards.suspended, now),
      ),
    )
    .orderBy(CardSorts.DIFFICULTY_ASC.db)
    .limit(MAX_CARDS_TO_FETCH);
  console.log(success`Fetched ${cardWithContents.length} review cards`);

  return cardWithContents as SessionCard[];
}

/**
 * Retrieves the new cards that can be learned today.
 *
 * New cards have a state of "New" and a difficulty of "0",
 * so we have to spread them out amongst the reviews.
 */
async function getNewCards(): Promise<SessionCard[]> {
  const now = new Date();

  console.log("Fetching new cards");
  const numLearnTodayRes = await db
    .select({
      total: sql<number>`cast(count(*) as int)`,
    })
    .from(reviewLogs)
    .where(and(lte(reviewLogs.createdAt, now), eq(reviewLogs.state, states[0])))
    .orderBy(desc(reviewLogs.createdAt))
    .groupBy(reviewLogs.cardId);

  const numLearnToday = numLearnTodayRes[0]?.total ?? 0;
  if (typeof numLearnToday !== "number") {
    throw new TRPCError({
      message: "Failed to get the number of cards learned today",
      code: "INTERNAL_SERVER_ERROR",
    });
  }

  if (numLearnToday >= MAX_LEARN_PER_DAY) {
    console.log(`Already learnt ${numLearnToday} cards today.`);
    return [];
  }

  const numLeft = MAX_LEARN_PER_DAY - numLearnToday;
  const limit = Math.min(numLeft, MAX_CARDS_TO_FETCH);

  console.log(`User can still learn ${numLeft} cards today`);
  const cardWithContents = await db
    .select()
    .from(cardContents)
    .leftJoin(cards, eq(cardContents.cardId, cards.id))
    .where(
      and(
        // Filter out deleted cards
        eq(cardContents.deleted, false),
        eq(cards.deleted, false),
        // Filter out cards that are not in new state
        eq(cards.state, states[0]),
        // Filter out cards that are not due or suspended
        lte(cards.due, now),
        lte(cards.suspended, now),
      ),
    )
    .orderBy(CardSorts.CREATED_AT_ASC.db)
    .limit(limit);
  console.log(success`Fetched ${cardWithContents.length} new cards`);

  return cardWithContents as SessionCard[];
}

async function getStats(): Promise<SessionStats> {
  console.log("Fetching stats");
  const now = new Date();

  const stats = await db
    .select({
      total: sql<number>`cast(count(*) as int)`,
      new: sql<number>`cast(count(
          case when ${cards.state} = 'New' then 1 else null end
        ) as int)`,
      learning: sql<number>`cast(count(
          case when ${cards.state} = 'Learning' OR ${cards.state} = 'Relearning' then 1 else null end
        ) as int)`,
      review: sql<number>`cast(count(
          case when ${cards.state} = 'Review' then 1 else null end
        ) as int)`,
    })
    .from(cards)
    .where(
      and(
        eq(cards.deleted, false),
        lte(cards.due, now),
        lte(cards.suspended, now),
      ),
    );

  console.log(success`Fetched stats`);
  return stats[0];
}

export const cardRouter = router({
  // Get all the cards for the session
  sessionData: publicProcedure.query(async ({ ctx }) => {
    const [reviewCards, newCards, stats] = await Promise.all([
      getReviewCards(),
      getNewCards(),
      getStats(),
    ]);
    return {
      newCards: newCards,
      reviewCards: reviewCards,
      stats: stats,
    } satisfies SessionData;
  }),

  // Create a new card with content
  create: publicProcedure
    .input(createCardFormSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("Adding card");
      const { question, answer, deckIds } = input;
      const { card, cardContent } = newCardWithContent(question, answer);

      const res = await db.transaction(async (tx) => {
        const insertedCard = await tx.insert(cards).values(card).returning();
        const insertedCardContent = await tx
          .insert(cardContents)
          .values(cardContent)
          .returning();

        if (deckIds && deckIds.length > 0) {
          console.log("Adding cards to decks");
          const cardsToDecksToInsert = deckIds.map((deckId) => ({
            cardId: insertedCard[0].id,
            deckId,
          })) satisfies NewCardsToDecks[];
          await tx.insert(cardsToDecks).values(cardsToDecksToInsert);
          console.log(
            success`Added ${cardsToDecksToInsert.length} cards to decks`,
          );
        }

        return {
          cards: insertedCard[0],
          card_contents: insertedCardContent[0],
        };
      });

      console.log(success`Added card: ${card.id}`);

      return res;
    }),

  // Create many cards
  createMany: publicProcedure
    .input(createManyCardsFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { cardInputs, deckIds } = input;
      console.log(`Adding ${cardInputs.length} cards`);
      const cardWithContents = cardInputs.map(({ question, answer }) =>
        newCardWithContent(question, answer),
      );

      const cardsToInsert = cardWithContents.map(({ card }) => card);
      const cardContentsToInsert = cardWithContents.map(
        ({ cardContent }) => cardContent,
      );

      const res = await db.transaction(async (tx) => {
        const insertedCards = await tx
          .insert(cards)
          .values(cardsToInsert)
          .returning();
        const insertedCardContents = await tx
          .insert(cardContents)
          .values(cardContentsToInsert)
          .returning();

        if (deckIds && deckIds.length > 0) {
          console.log("Adding cards to decks");
          const cardsToDecksToInsert = deckIds.flatMap((deckId) =>
            insertedCards.map((card) => ({
              cardId: card.id,
              deckId,
            })),
          ) satisfies NewCardsToDecks[];
          await tx.insert(cardsToDecks).values(cardsToDecksToInsert);
          console.log(
            success`Added ${cardsToDecksToInsert.length} cards to decks`,
          );
        }

        return insertedCards.map((card, index) => ({
          cards: card,
          card_contents: insertedCardContents[index],
        }));
      });

      console.log(success`Added ${cardInputs.length} cards`);
      return res;
    }),

  // Delete a card
  delete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      console.log("Deleting card");
      await db.transaction(async (tx) => {
        await tx
          .update(cards)
          .set({ deleted: true })
          .where(eq(cards.id, input));
        await tx
          .update(cardContents)
          .set({ deleted: true })
          .where(eq(cardContents.cardId, input));
      });

      console.log(success`Deleted card: ${input}`);
    }),

  undoDelete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const card = await db.query.cards.findFirst({
        where: eq(cards.id, input),
      });
      if (!card) {
        throw new TRPCError({
          message: "Card not found",
          code: "BAD_REQUEST",
        });
      }

      console.log("Undoing delete card");
      await db.transaction(async (tx) => {
        await tx
          .update(cards)
          .set({ deleted: false })
          .where(eq(cards.id, input));
        await tx
          .update(cardContents)
          .set({ deleted: false })
          .where(eq(cardContents.cardId, input));
      });
      console.log(success`Undo delete card: ${input}`);
    }),

  // Edit card content
  edit: publicProcedure
    .input(
      z.object({
        cardContentId: z.string(),
        question: z.string(),
        answer: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("Editing card content");
      const { cardContentId: id, question, answer } = input;
      await db
        .update(cardContents)
        .set({
          question,
          answer,
        })
        .where(eq(cardContents.id, id));

      console.log(success`Edited card content: ${id}`);
    }),

  // Grade a card
  grade: publicProcedure
    .input(
      z.object({
        id: z.string(),
        grade: z.enum(ratings),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("Grading card");
      const card = await db.query.cards.findFirst({
        where: eq(cards.id, input.id),
      });

      if (!card) {
        throw new TRPCError({
          message: "Card not found",
          code: "BAD_REQUEST",
        });
      }

      const { nextCard, reviewLog } = gradeCard(card, input.grade);
      await db.transaction(async (tx) => {
        await tx.update(cards).set(nextCard).where(eq(cards.id, input.id));
        await tx.insert(reviewLogs).values(reviewLog);
      });

      await db.update(cards).set(nextCard).where(eq(cards.id, input.id));
      console.log(success`Graded card: ${input.id}`);
    }),

  // Suspend a card
  suspend: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        suspendUntil: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("Suspending card");
      const { id, suspendUntil } = input;

      await db
        .update(cards)
        .set({ suspended: suspendUntil })
        .where(eq(cards.id, id));

      console.log(success`Suspended card: ${input.id}`);
    }),
});
