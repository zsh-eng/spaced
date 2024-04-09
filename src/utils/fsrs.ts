import {
  Card,
  CardContent,
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
  type Grade as FSRSGrade,
  type State as FSRSState,
  type Card as FSRSCard,
} from 'ts-fsrs';

const params = generatorParameters({ enable_fuzz: true });
const f = fsrs(params);

export type StringifyDate<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends Date | null
    ? string | null
    : T[K];
};


// TODO use "FSRSRating" instead
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

export function getReviewDayForEachRating(
  card: Card | StringifyDate<Card>
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
