import { Card, Rating as SchemaRating, ratings } from '@/schema';
import {
  Grade,
  Grades,
  createEmptyCard,
  fsrs,
  generatorParameters,
} from 'ts-fsrs';

const params = generatorParameters({ enable_fuzz: true });
const f = fsrs(params);

// TODO use "FSRSRating" instead
function schemaRatingToFsrsGrade(rating: SchemaRating): Grade {
  const index = ratings.indexOf(rating);
  if (index === -1) {
    throw new Error(`Invalid rating: ${rating}`);
  }

  return index as Grade;
}

function fsrsGradeToSchemaRating(grade: Grade): SchemaRating {
  return ratings[grade];
}

export function getNextCard(card: Card, schemaRating: SchemaRating) {
  const now = new Date();
  const recordLog = f.repeat(card, now);
  const grade = schemaRatingToFsrsGrade(schemaRating);
  const recordLogItem = recordLog[grade];
  const nextCard = recordLogItem.card;

  return nextCard;
}

export function getReviewDayForEachRating(
  card: Card
): Record<SchemaRating, Date> {
  const now = new Date();
  console.log(JSON.stringify(card, null, 2));
  console.log(JSON.stringify(createEmptyCard(), null, 2));
  const recordLog = f.repeat(card, now);

  const schemaRatingtoReviewDate = Object.fromEntries(
    ratings.map((rating) => [rating, new Date()])
  ) as Record<SchemaRating, Date>;

  for (const grade of Grades) {
    const nextScheduledDate = recordLog[grade].card.due;
    const rating = fsrsGradeToSchemaRating(grade);
    schemaRatingtoReviewDate[rating] = nextScheduledDate;
  }

  return schemaRatingtoReviewDate;
}
