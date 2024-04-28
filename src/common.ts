import { Rating } from "@/schema";

/**
 * The limit below which we should refetch cards.
 */
export const THRESHOLD_CARDS_FOR_REFETCH = 10;

export const KEY_RATING_AGAIN = "1";
export const KEY_RATING_HARD = "2";
export const KEY_RATING_GOOD = "3";
export const KEY_RATING_EASY = "4";

export const KEY_TO_RATING: Record<string, Rating> = {
  [KEY_RATING_AGAIN]: "Again",
  [KEY_RATING_HARD]: "Hard",
  [KEY_RATING_GOOD]: "Good",
  [KEY_RATING_EASY]: "Easy",
  [" "]: "Good",
};

export const RATING_TO_KEY: Record<Rating, string | undefined> = {
  Again: KEY_RATING_AGAIN,
  Hard: KEY_RATING_HARD,
  Good: KEY_RATING_GOOD,
  Easy: KEY_RATING_EASY,
  Manual: undefined,
};

export const MAX_CARDS_TO_FETCH = 50;
export const MAX_LEARN_PER_DAY = 50;
