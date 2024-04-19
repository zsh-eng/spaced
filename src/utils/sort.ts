// Sort orders
// There are numerous ways of sorting the order in which cards should be appearing
// See discussion here: https://github.com/ishiko732/ts-fsrs-demo/issues/17
// For simplicity, we'll stick to sorting by difficulty in ascending order
// as suggested by the library maintainer.
// In future, we can add more sorting options through a settings page.

import { cards, type Card } from "@/schema";
import { asc, desc, type SQL } from "drizzle-orm";

export type Sort = {
  /**
   */
  fn: (a: Card, b: Card) => number;
  /**
   * Returns a drizzle SQL object that can be used to sort the cards
   */
  db: SQL;
};

/**
 * Sorts by the "difficulty" field in ascending order.
 * difficulty is a value handled by the ts-fsrs library.
 */
const DIFFICULTY_ASC: Sort = {
  fn: (a, b) => a.difficulty - b.difficulty,
  db: asc(cards.difficulty),
};

const CREATED_AT_ASC: Sort = {
  fn: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  db: asc(cards.createdAt),
};

const CREATED_AT_DESC: Sort = {
  fn: (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  db: desc(cards.createdAt),
};

export const CardSorts = {
  DIFFICULTY_ASC,
  CREATED_AT_ASC,
  CREATED_AT_DESC,
} as const;
