import { MAX_CARDS_TO_FETCH, MAX_LEARN_PER_DAY } from "@/common";
import db from "@/db";
import {
  AICardOutput,
  aiCardOutputSchema,
  cardSchema,
  createCardFormSchema,
  createManyCardsFormSchema,
} from "@/form";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import {
  NewCardsToDecks,
  User,
  cardContents,
  cards,
  cardsToDecks,
  decks,
  ratings,
  reviewLogs,
  states,
  users,
} from "@/schema";
import { premiumProcedure, protectedProcedure, router } from "@/server/trpc";
import { success } from "@/utils/format";
import { cardToReviewLog, gradeCard, newCardWithContent } from "@/utils/fsrs";
import { SessionCard, SessionData, SessionStats } from "@/utils/session";
import { CardSorts } from "@/utils/sort";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, lte, ne, sql } from "drizzle-orm";
import { z } from "zod";

/**
 * Retrieves the number of cards left to learn today.
 * Each day, we set a limit to the number of new cards that can be learned.
 */
async function getNumberLeftToLearnToday(
  user: User,
  now: Date,
): Promise<number> {
  const numLearnTodayRes = await db
    .select({
      total: sql<number>`cast(count(*) as int)`,
    })
    .from(reviewLogs)
    .leftJoin(cards, eq(reviewLogs.cardId, cards.id))
    .leftJoin(users, eq(cards.userId, users.id))
    .where(
      and(
        eq(users.id, user.id),
        lte(reviewLogs.createdAt, now),
        eq(reviewLogs.state, states[0]),
      ),
    )
    .orderBy(desc(reviewLogs.createdAt))
    .groupBy(reviewLogs.cardId);

  const numLearnToday = numLearnTodayRes[0]?.total ?? 0;
  if (typeof numLearnToday !== "number") {
    throw new TRPCError({
      message: "Failed to get the number of cards learned today",
      code: "INTERNAL_SERVER_ERROR",
    });
  }

  const numLeft = MAX_LEARN_PER_DAY - numLearnToday;

  // Assertion to catch for any bugs
  if (numLeft < 0) {
    throw new TRPCError({
      message: "Number of cards learned today is more than the limit",
      code: "INTERNAL_SERVER_ERROR",
    });
  }

  return numLeft;
}

async function getReviewCards(user: User, now: Date): Promise<SessionCard[]> {
  console.log("Fetching review cards");
  const cardWithContents = await db
    .select()
    .from(cardContents)
    .leftJoin(cards, eq(cardContents.cardId, cards.id))
    .leftJoin(users, eq(cards.userId, users.id))
    .where(
      and(
        eq(users.id, user.id),
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
async function getNewCards(
  user: User,
  now: Date,
  numLeftToLearn: number,
): Promise<SessionCard[]> {
  if (numLeftToLearn <= 0) {
    return [];
  }

  console.log("Fetching new cards");
  // In case the user can learn more cards than the limit cards to fetch
  const limit = Math.min(numLeftToLearn, MAX_CARDS_TO_FETCH);

  console.log(`User can still learn ${numLeftToLearn} cards today`);
  const cardWithContents = await db
    .select()
    .from(cardContents)
    .leftJoin(cards, eq(cardContents.cardId, cards.id))
    .leftJoin(users, eq(cards.userId, users.id))
    .where(
      and(
        eq(users.id, user.id),
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

async function getStats(
  user: User,
  now: Date,
  numLeftToLearn: number,
): Promise<SessionStats> {
  console.log("Fetching stats");
  // Note that the total value still reflects all the cards to be reviewed,
  // and doesn't care about the limit of new cards to learn today.
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
    .leftJoin(users, eq(cards.userId, users.id))
    .where(
      and(
        eq(users.id, user.id),
        eq(cards.deleted, false),
        lte(cards.due, now),
        lte(cards.suspended, now),
      ),
    );
  console.log(success`Fetched stats`);
  const stat = stats[0];
  return {
    ...stat,
    new: Math.min(numLeftToLearn, stat.new),
  };
}

async function checkIfDecksBelongToUser(
  user: User,
  deckIds?: string[],
): Promise<boolean> {
  if (!deckIds || deckIds.length === 0) return true;

  const foundDecks = await db.query.decks.findMany({
    where: and(
      eq(decks.userId, user.id),
      inArray(decks.id, deckIds),
      eq(decks.deleted, false),
    ),
  });

  const foundDecksSet = new Set(foundDecks.map((deck) => deck.id));
  const allDecksFound = deckIds.every((deckId) => foundDecksSet.has(deckId));

  if (allDecksFound) return true;
  return false;
}

async function checkIfCardBelongsToUser(
  user: User,
  cardId: string,
): Promise<boolean> {
  // We allow for deleted, since the user might want to undo delete
  const card = await db.query.cards.findFirst({
    where: and(eq(cards.id, cardId), eq(cards.userId, user.id)),
  });

  return !!card;
}

export const cardRouter = router({
  // Get all the cards for the session
  sessionData: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    const now = new Date();

    const numLeftToLearn = await getNumberLeftToLearnToday(user, now);
    const [reviewCards, newCards, stats] = await Promise.all([
      getReviewCards(user, now),
      getNewCards(user, now, numLeftToLearn),
      getStats(user, now, numLeftToLearn),
    ]);
    return {
      newCards: newCards,
      reviewCards: reviewCards,
      stats: stats,
    } satisfies SessionData;
  }),

  getAllBySourceId: protectedProcedure
    .input(
      z.object({
        sourceId: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      console.log("Fetching card by source ID:", input.sourceId);
      const cardWithContents = await db
        .select()
        .from(cardContents)
        .leftJoin(cards, eq(cardContents.cardId, cards.id))
        .where(eq(cardContents.sourceId, input.sourceId));

      console.log(success`Fetched card by source ID: ${input.sourceId}`);
      return cardWithContents as SessionCard[];
    }),

  // Create a new card with content
  create: protectedProcedure
    .input(createCardFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      const allDecksBelongToUser = await checkIfDecksBelongToUser(
        user,
        input.deckIds,
      );
      if (!allDecksBelongToUser) {
        throw new TRPCError({
          message: "Some decks do not belong to the user",
          code: "FORBIDDEN",
        });
      }

      console.log("Adding card");
      const { question, answer, deckIds, metadata } = input;
      const { card, cardContent } = newCardWithContent(
        user.id,
        question,
        answer,
        metadata?.source,
        metadata?.sourceId,
        metadata,
      );

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
  createMany: protectedProcedure
    .input(createManyCardsFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { cardInputs, deckIds, metadata } = input;

      const allDecksBelongToUser = await checkIfDecksBelongToUser(
        user,
        deckIds,
      );
      if (!allDecksBelongToUser) {
        throw new TRPCError({
          message: "Some decks do not belong to the user",
          code: "FORBIDDEN",
        });
      }

      const cardWithContents = cardInputs.map(({ question, answer }) =>
        newCardWithContent(
          user.id,
          question,
          answer,
          metadata?.source,
          metadata?.sourceId,
          metadata,
        ),
      );

      const cardsToInsert = cardWithContents.map(({ card }) => card);
      const cardContentsToInsert = cardWithContents.map(
        ({ cardContent }) => cardContent,
      );

      // When using drizzle's transaction, we bump into an issue
      // of error when batch inserting.
      // For now, let's now use transactions and instead just insert normally
      // This is a bit risky, but we can't do much about it for now.
      // See https://github.com/tursodatabase/libsql-client-ts/issues/177
      const insertedCards = await db
        .insert(cards)
        .values(cardsToInsert)
        .returning();
      const insertedCardContents = await db
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
        await db.insert(cardsToDecks).values(cardsToDecksToInsert);
        console.log(
          success`Added ${cardsToDecksToInsert.length} cards to decks`,
        );
      }

      console.log(success`Added ${cardInputs.length} cards`);

      return insertedCards.map((card, index) => ({
        cards: card,
        card_contents: insertedCardContents[index],
      }));
    }),

  // Delete a card
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        deleted: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { id, deleted = true } = input;

      const belongsToUser = await checkIfCardBelongsToUser(user, id);
      if (!belongsToUser) {
        throw new TRPCError({
          message: "Card does not belong to the user",
          code: "FORBIDDEN",
        });
      }

      console.log(`Setting card as deleted: ${deleted}`);
      await db.transaction(async (tx) => {
        await tx.update(cards).set({ deleted }).where(eq(cards.id, id));
        await tx
          .update(cardContents)
          .set({ deleted })
          .where(eq(cardContents.cardId, id));
      });

      console.log(success`Set card ${id} as deleted: ${deleted}`);
    }),

  undoDelete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const card = await db.query.cards.findFirst({
        where: eq(cards.id, input),
      });
      if (!card) {
        throw new TRPCError({
          message: "Card not found",
          code: "BAD_REQUEST",
        });
      }

      const belongsToUser = await checkIfCardBelongsToUser(user, input);
      if (!belongsToUser) {
        throw new TRPCError({
          message: "Card does not belong to the user",
          code: "FORBIDDEN",
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
  edit: protectedProcedure
    .input(
      z.object({
        cardContentId: z.string(),
        question: z.string(),
        answer: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      const card = await db.query.cardContents.findFirst({
        where: eq(cardContents.id, input.cardContentId),
      });
      if (!card) {
        throw new TRPCError({
          message: "Card not found",
          code: "BAD_REQUEST",
        });
      }

      const belongsToUser = await checkIfCardBelongsToUser(user, card.cardId);
      if (!belongsToUser) {
        throw new TRPCError({
          message: "Card does not belong to the user",
          code: "FORBIDDEN",
        });
      }

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
  grade: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        grade: z.enum(ratings),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      console.log("Grading card");
      const card = await db.query.cards.findFirst({
        where: and(eq(cards.id, input.id), eq(cards.userId, user.id)),
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

  // Manually grade a card
  manualGrade: protectedProcedure
    .input(
      z.object({
        card: cardSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { card } = input;

      const currentCard = await db.query.cards.findFirst({
        where: and(eq(cards.id, card.id), eq(cards.userId, user.id)),
      });

      if (!currentCard) {
        throw new TRPCError({
          message: "Card not found",
          code: "BAD_REQUEST",
        });
      }

      console.log(`Manually grading card: ${card.id}`);
      // When manually grading, we save the current version of the card
      // as a review log
      const reviewLog = cardToReviewLog(currentCard, "Manual");
      await db.transaction(async (tx) => {
        await tx.update(cards).set(card).where(eq(cards.id, card.id));
        await tx.insert(reviewLogs).values(reviewLog);
      });

      console.log(success`Manually graded card: ${card.id}`);
    }),

  // Suspend a card
  suspend: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        suspendUntil: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;

      const belongsToUser = await checkIfCardBelongsToUser(user, input.id);
      if (!belongsToUser) {
        throw new TRPCError({
          message: "Card does not belong to the user",
          code: "FORBIDDEN",
        });
      }

      console.log("Suspending card");
      const { id, suspendUntil } = input;

      await db
        .update(cards)
        .set({ suspended: suspendUntil })
        .where(eq(cards.id, id));

      console.log(success`Suspended card: ${input.id}`);
    }),

  aiGenerate: premiumProcedure
    .input(
      z.object({
        query: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      console.log("AI generating card for query:", input.query);
      const prompt = `
You are tasked with generating flashcards that adhere to the principles outlined in SuperMemo's "20 Rules for Formulating Knowledge." These rules focus on creating effective and memorable flashcards. Here are the key guidelines for creating these flashcards:

1. **Clarity and Simplicity:** Ensure each flashcard is clear and concise. Avoid complex language and focus on simplicity to aid understanding and retention.

2. **Single Concept Per Card:** Each flashcard should focus on a single concept or piece of information to prevent cognitive overload.

3. **Use of Images and Examples:** Where applicable, incorporate images or examples to enhance understanding and memory retention.

4. **Question and Answer Format:** Structure each flashcard in a question and answer format to facilitate active recall.

5. **Avoid Ambiguity:** Ensure that the questions and answers are unambiguous, providing clear and precise information.

6. **Relevance and Context:** Provide context where necessary to make the information relevant and easier to understand.

7. **Bidirectional Learning:** If the user requests, generate flashcards in both directions (e.g., "What is the capital of France?" and "Paris is the capital of which country?").

8. **Simple Translations:** For simple word translations, generate straightforward flashcards without overthinking the formulation.

**Example Flashcard:**

- **Question:** What is the process by which plants convert sunlight into chemical energy?
- **Answer:** Photosynthesis.

**Instructions for the Model:**

- Generate flashcards that adhere to the above guidelines.
- For simple translations, provide direct and straightforward flashcards.
- If bidirectional learning is requested, create two separate flashcards to cover both directions of learning.
      `;
      const output = await generateObject({
        model: openai("gpt-4o-2024-08-06"),
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: input.query,
          },
        ],
        schema: aiCardOutputSchema,
      });
      console.log(success`AI generated`, output.object.cards.length, "cards");
      return output.object;
    }),
});
