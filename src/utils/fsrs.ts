import {
  Card,
  NewCard,
  NewCardContent,
  Rating,
  State,
  ratings,
  states,
} from '@/schema';
import {
  Grades as FSRSGrades,
  createEmptyCard,
  fsrs,
  generatorParameters,
  type Card as FSRSCard,
  type Grade as FSRSGrade,
  type State as FSRSState,
} from 'ts-fsrs';

const params = generatorParameters({ enable_fuzz: true });
const f = fsrs(params);

/**
 * Helper type to convert a {@link Date} or `Date | null` to a {@link string}.
 * JSON serialises {@link Date} objects to strings.
 * ts-fsrs accepts strings for date inputs, so it's ok to take in date strings.
 */
export type StringifyDate<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
    ? string | null
    : T[K];
};
export type AllowDateString<T> = T | StringifyDate<T>;

function ratingToFSRSGrade(rating: Rating): FSRSGrade {
  const index = ratings.indexOf(rating);
  if (index === -1) {
    throw new Error(`Invalid rating: ${rating}`);
  }

  return index as FSRSGrade;
}

function fsrsGradeToRating(grade: FSRSGrade): Rating {
  return ratings[grade];
}

function fsrsStateToState(state: FSRSState): State {
  return states[state];
}

export function getNextCard(card: Card, schemaRating: Rating) {
  const now = new Date();
  const recordLog = f.repeat(card, now);
  const grade = ratingToFSRSGrade(schemaRating);
  const recordLogItem = recordLog[grade];
  const nextCard = recordLogItem.card;

  return nextCard;
}

/**
 * Give a {@link Card}, returns the review {@link Date} for each {@link Rating}.
 */
export function getReviewDateForEachRating(
  card: AllowDateString<Card>
): Record<Rating, Date> {
  const now = new Date();
  const recordLog = f.repeat(card, now);

  const schemaRatingtoReviewDate = Object.fromEntries(
    ratings.map((rating) => [rating, new Date()])
  ) as Record<Rating, Date>;

  for (const grade of FSRSGrades) {
    const nextScheduledDate = recordLog[grade].card.due;
    const rating = fsrsGradeToRating(grade);
    schemaRatingtoReviewDate[rating] = nextScheduledDate;
  }

  return schemaRatingtoReviewDate;
}

export function stringifyCardDate(card: Card): StringifyDate<Card> {
  return {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review?.toISOString() ?? null,
  };
}

export function parseCardDate(card: AllowDateString<Card>): Card {
  return {
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : null,
  };
}

export function gradeCard(card: Card, schemaRating: Rating): Card {
  const now = new Date();
  const recordLog = f.repeat(card, now);
  const grade = ratingToFSRSGrade(schemaRating);
  const recordLogItem = recordLog[grade];
  const nextCard = mergeFsrsCard(recordLogItem.card, card);

  return nextCard;
}

function mergeFsrsCard(fsrsCard: FSRSCard, card: Card): Card {
  return {
    ...card,
    ...fsrsCard,
    state: fsrsStateToState(fsrsCard.state),
  };
}

export function newCard(): NewCard {
  const emptyCard = createEmptyCard();
  const id = crypto.randomUUID();
  return {
    ...emptyCard,
    state: fsrsStateToState(emptyCard.state),
    id,
  };
}

export function newCardWithContent(
  question?: string,
  answer?: string
): {
  card: NewCard;
  cardContent: NewCardContent;
} {
  const card = newCard();
  const cardContentId = crypto.randomUUID();
  return {
    card,
    cardContent: {
      id: cardContentId,
      cardId: card.id,
      question,
      answer,
    },
  };
}
