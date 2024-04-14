import {
  Card,
  CardContent,
  NewCard,
  NewCardContent,
  NewReviewLog,
  Rating,
  State,
  ratings,
  states,
} from "@/schema";
import {
  Grades as FSRSGrades,
  createEmptyCard,
  fsrs,
  generatorParameters,
  type Card as FSRSCard,
  type Grade as FSRSGrade,
  type State as FSRSState,
} from "ts-fsrs";

const params = generatorParameters({ enable_fuzz: true });
const f = fsrs(params);

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
export function getReviewDateForEachRating(card: Card): Record<Rating, Date> {
  const now = new Date();
  const recordLog = f.repeat(card, now);

  const schemaRatingtoReviewDate = Object.fromEntries(
    ratings.map((rating) => [rating, new Date()]),
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

export function newCardContent(
  cardId: string,
  question: string,
  answer: string,
): NewCardContent {
  const id = crypto.randomUUID();
  return {
    id,
    cardId,
    question,
    answer,
  };
}

export function newCardWithContent(
  question?: string,
  answer?: string,
): {
  card: Card;
  cardContent: CardContent;
} {
  const card = newCard();
  const cardContent = newCardContent(card.id, question ?? "", answer ?? "");
  return {
    card: newCardToCard(card),
    cardContent: newCardContentToCardContent(cardContent),
  };
}

export function newCardToCard(newCard: NewCard): Card {
  if (!newCard.due) throw new Error("Due date is required");
  return {
    ...newCard,
    createdAt: new Date(),
    due: newCard.due,
    last_review: null,
    suspended: false,
    deleted: false,
  };
}

export function newCardContentToCardContent(
  newCardContent: NewCardContent,
): CardContent {
  return {
    ...newCardContent,
    createdAt: new Date(),
    deleted: false,
    question: newCardContent.question ?? "",
    answer: newCardContent.answer ?? "",
    source: newCardContent.source ?? "",
    sourceId: null,
    extend: newCardContent.extend ?? {},
  };
}

export function cardToReviewLog(card: Card, grade: Rating): NewReviewLog {
  return {
    ...card,
    id: crypto.randomUUID(),
    cardId: card.id,
    last_elapsed_days: card.elapsed_days,
    review: new Date(),
    grade,
  };
}
