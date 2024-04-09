import db from '@/db';
import { success } from '@/utils/format';
import {
  NewCard,
  NewCardContent,
  NewReviewLog,
  cardContents,
  cards,
  ratings,
  reviewLogs,
  states,
} from '@/schema';
import { faker } from '@faker-js/faker';
import { Card, CardContent, ReviewLog } from './schema';

// Data generated using the faker-js library.
// See https://fakerjs.dev/api/

function generateNewCard(newCard?: Partial<NewCard>): NewCard {
  return {
    id: crypto.randomUUID(),
    stability: faker.number.float({ min: 0, max: 1 }),
    difficulty: faker.number.float({ min: 0, max: 1 }),
    elapsed_days: faker.number.int({ min: 0, max: 100 }),
    scheduled_days: faker.number.int({ min: 0, max: 100 }),
    reps: faker.number.int({ min: 0, max: 100 }),
    lapses: faker.number.int({ min: 0, max: 100 }),
    state: faker.helpers.arrayElement(states),
    // Last review date is necesary in `f.repeat`
    // as the `elapsed_days` for the `SchedulingCard` is calculated based on the last review date.
    last_review: new Date(
      faker.date
        .between({
          from: new Date('2024-01-01'),
          to: new Date(),
        })
        .getTime()
    ),
    ...newCard,
  };
}

function generateNewCardContent(
  cardId: string,
  newCardContent?: Partial<NewCardContent>
): NewCardContent {
  return {
    id: crypto.randomUUID(),
    cardId,
    question: faker.lorem.sentence(),
    answer: faker.lorem.paragraph(),
    source: faker.lorem.sentence(),
    sourceId: faker.lorem.sentence(),
    ...newCardContent,
  };
}

function generateNewReviewLog(
  cardId: string,
  newReviewLog?: Partial<NewReviewLog>
): NewReviewLog {
  return {
    id: crypto.randomUUID(),
    cardId,
    grade: faker.helpers.arrayElement(ratings),
    state: faker.helpers.arrayElement(states),

    due: new Date(faker.date.recent().getTime()),
    stability: faker.number.float({ min: 0, max: 1 }),
    difficulty: faker.number.float({ min: 0, max: 1 }),
    elapsed_days: faker.number.int({ min: 0, max: 100 }),
    last_elapsed_days: faker.number.int({ min: 0, max: 100 }),
    scheduled_days: faker.number.int({ min: 0, max: 100 }),
    review: new Date(faker.date.recent().getTime()),
    ...newReviewLog,
  };
}

/**
 * Seed the database with some random data.
 * Note that this script can take a while to run since we're inserting data into the Turso database.
 *
 * Each {@link Card} has a corresponding {@link CardContent} and {@link ReviewLog}.
 * TODO Add more review logs for each card - we can simulate using the `ts-fsrs` library to generate reviews.
 *
 *
 */
async function main() {
  console.log('Deleting all data from the database');
  await db.delete(reviewLogs).all();
  await db.delete(cardContents).all();
  await db.delete(cards).all();
  console.log(success`Deleted all data from the database`);

  const itemsToCreate = 100;
  console.log('Seeding database with', itemsToCreate, 'items');

  for (let i = 0; i < itemsToCreate; i++) {
    const card = generateNewCard();
    const cardContent = generateNewCardContent(card.id);
    const reviewLog = generateNewReviewLog(card.id);

    await db.insert(cards).values(card);
    await db.insert(cardContents).values(cardContent);
    await db.insert(reviewLogs).values(reviewLog);
  }
  console.log(success`Seeded database with ${itemsToCreate} items`);
}

main();
