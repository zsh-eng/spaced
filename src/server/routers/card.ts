import { endOfDay } from 'date-fns';
import { Card, CardContent, cardContents, cards, ratings } from '@/schema';
import { publicProcedure, router } from '@/server/trpc';
import { success } from '@/utils/format';
import { gradeCard, newCardWithContent } from '@/utils/fsrs';
import { TRPCError } from '@trpc/server';
import { and, asc, eq, lte } from 'drizzle-orm';
import { z } from 'zod';
import db from '@/db';

export const cardRouter = router({
  // Get all cards with their contents
  all: publicProcedure.query(async ({ ctx }) => {
    console.log('Fetching cards');
    const now = endOfDay(new Date());

    const cardWithContents = await db
      .select()
      .from(cardContents)
      .leftJoin(cards, eq(cardContents.cardId, cards.id))
      .where(
        and(
          eq(cardContents.deleted, false),
          eq(cards.deleted, false),
          lte(cards.due, now)
        )
      )
      .orderBy(asc(cards.due));
    console.log(success`Fetched ${cardWithContents.length} cards`);
    return cardWithContents as {
      cards: Card;
      card_contents: CardContent;
    }[];
  }),

  // Create a new card with content
  add: publicProcedure
    .input(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('Adding card');
      const { question, answer } = input;
      const { card, cardContent } = newCardWithContent(question, answer);

      await db.transaction(async (tx) => {
        await tx.insert(cards).values(card);
        await tx.insert(cardContents).values(cardContent);
      });

      console.log(success`Added card: ${card.id}`);
    }),

  // Delete a card
  delete: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      console.log('Deleting card');
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

  // Edit card content
  edit: publicProcedure
    .input(
      z.object({
        cardContentId: z.string(),
        question: z.string(),
        answer: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('Editing card content');
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('Grading card');
      const card = await db.query.cards.findFirst({
        where: eq(cards.id, input.id),
      });

      if (!card) {
        throw new TRPCError({
          message: 'Card not found',
          code: 'BAD_REQUEST',
        });
      }

      const nextCard =
        input.grade === 'Manual' ? card : gradeCard(card, input.grade);
      await db.update(cards).set(nextCard).where(eq(cards.id, input.id));
      console.log(success`Graded card: ${input.id}`);
    }),
});