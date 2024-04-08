import { relations, sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// This file contains the schema for the database.
// Note that timestamp, boolean, and enum are not supported in SQLite.
// The enum type is used for type inference, and not enforced in the database.
// See https://orm.drizzle.team/docs/column-types/sqlite#text

// See https://open-spaced-repetition.github.io/ts-fsrs/
// TODO add user and auth
// TODO Store parameters for users to allow for customisation
// Parameters

export const states = ['New', 'Learning', 'Review', 'Relearning'] as const;
export type State = (typeof states)[number];

export const ratings = ['Manual', 'Again', 'Hard', 'Good', 'Easy'] as const;
export type Rating = (typeof ratings)[number];

export const reviewLogs = sqliteTable('review_logs', {
  id: text('id').primaryKey(),
  cardId: text('card_id').notNull(),
  grade: text('grade', { enum: ratings }).notNull(),
  state: text('state', { enum: states }).notNull(),

  due: integer('due', { mode: 'timestamp' }).notNull(),
  stability: real('stability').notNull(),
  difficulty: real('difficulty').notNull(),
  elapsed_days: integer('elapsed_days').notNull(),
  last_elapsed_days: integer('last_elapsed_days').notNull(),
  scheduled_days: integer('scheduled_days').notNull(),
  review: integer('review', { mode: 'timestamp' }).notNull(),
  duration: integer('duration').notNull().default(0),
  deleted: integer('deleted', { mode: 'boolean' }).notNull().default(false),
});

export type ReviewLog = typeof reviewLogs.$inferSelect;
export type NewReviewLog = typeof reviewLogs.$inferInsert;

// * For now we just copy the schema from the ts-fsrs-demo example
export const cards = sqliteTable('cards', {
  id: text('id').primaryKey(),
  due: integer('due', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  stability: real('stability').notNull(),
  difficulty: real('difficulty').notNull(),
  elapsed_days: integer('elapsed_days').notNull(),
  scheduled_days: integer('scheduled_days').notNull(),
  reps: integer('reps').notNull(),
  lapses: integer('lapses').notNull(),
  state: text('state', { enum: states }).notNull(),
  last_review: integer('last_review', { mode: 'timestamp' }),

  suspended: integer('suspended', { mode: 'boolean' }).notNull().default(false),

  // revlogs logs
  deleted: integer('deleted', { mode: 'boolean' }).notNull().default(false),
});

export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;

export const cardContents = sqliteTable('card_contents', {
  id: text('id').primaryKey(),
  // card
  cardId: text('card_id').notNull(),

  question: text('question').notNull().default(''),
  answer: text('answer').notNull().default(''),
  source: text('source').notNull().default(''),
  sourceId: text('sourceId'),
  extend: text('extend', { mode: 'json' }),
  deleted: integer('deleted', { mode: 'boolean' }).notNull().default(false),
});

export type CardContent = typeof cardContents.$inferSelect;
export type NewCardContent = typeof cardContents.$inferInsert;

export const reviewLogsRelations = relations(reviewLogs, ({ one }) => ({
  card: one(cards, {
    fields: [reviewLogs.cardId],
    references: [cards.id],
  }),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  reviewLogs: many(reviewLogs),
}));

export const cardContentsRelations = relations(cardContents, ({ one }) => ({
  card: one(cards, {
    fields: [cardContents.cardId],
    references: [cards.id],
  }),
}));