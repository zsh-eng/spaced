import db from "@/db";
import { success } from "@/utils/format";
import {
  NewCard,
  NewCardContent,
  NewCardsToDecks,
  NewDeck,
  NewReviewLog,
  cardContents,
  cards,
  cardsToDecks,
  decks,
  ratings,
  reviewLogs,
  states,
} from "@/schema";
import { faker } from "@faker-js/faker";
import { Card, CardContent, ReviewLog } from "./schema";

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
          from: new Date("2024-01-01"),
          to: new Date(),
        })
        .getTime(),
    ),
    ...newCard,
  };
}

function generateNewCardContent(
  cardId: string,
  newCardContent?: Partial<NewCardContent>,
): NewCardContent {
  return {
    id: crypto.randomUUID(),
    cardId,
    question: faker.lorem.paragraph(),
    answer: faker.lorem.paragraphs({ min: 1, max: 3 }),
    source: faker.lorem.sentence(),
    sourceId: faker.lorem.sentence(),
    ...newCardContent,
  };
}

function generateNewReviewLog(
  cardId: string,
  newReviewLog?: Partial<NewReviewLog>,
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

function generateNewDeck(newDeck?: Partial<NewDeck>): NewDeck {
  return {
    id: crypto.randomUUID(),
    name: faker.lorem.word({
      length: { min: 1, max: 5 },
    }),
    description: faker.lorem.paragraph(),
    ...newDeck,
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
  console.log("Deleting all data from the database");
  await db.delete(reviewLogs).all();
  await db.delete(cardContents).all();
  await db.delete(cards).all();
  console.log(success`Deleted all data from the database`);

  console.log("Seeding database with 10 decks");
  const decksToCreate = 10;
  const decksToInsert = Array.from({ length: decksToCreate }, () =>
    generateNewDeck(),
  );
  await db.insert(decks).values(decksToInsert);
  console.log(success`Seeded database with ${decksToCreate} decks`);
  const deckIds = decksToInsert.map((deck) => deck.id);

  const itemsToCreate = 2000;
  // Seeding too many items will cause error with Turso for too many SQL variables
  const skip = 2000;
  const cardIds = Array.from({ length: itemsToCreate }, () =>
    crypto.randomUUID(),
  );

  console.log("Seeding database with", itemsToCreate, "items");
  for (let i = 0; i < itemsToCreate; i += skip) {
    const cardsToInsert: NewCard[] = [];
    const cardContentsToInsert: NewCardContent[] = [];
    const reviewLogsToInsert: NewReviewLog[] = [];

    for (let j = 0; j < Math.min(skip, itemsToCreate); j++) {
      const card = generateNewCard({
        id: cardIds[i + j],
      });
      const cardContent = generateNewCardContent(card.id);
      const reviewLog = generateNewReviewLog(card.id);

      cardsToInsert.push(card);
      cardContentsToInsert.push(cardContent);
      reviewLogsToInsert.push(reviewLog);
    }

    await db.insert(cards).values(cardsToInsert);
    await db.insert(cardContents).values(cardContentsToInsert);
    await db.insert(reviewLogs).values(reviewLogsToInsert);

    console.log(success`Seeded item ${i + 1}-${i + skip}`);
  }
  console.log(success`Seeded database with ${itemsToCreate} items`);

  console.log("Seeding mapping between cards and decks");
  const cardsToDecksToInsert: NewCardsToDecks[] = [];
  for (const id of cardIds) {
    const numDecksToBeAddedTo = faker.number.int({ min: 0, max: 4 });
    const decksToAddCardTo = faker.helpers
      .shuffle(deckIds)
      .slice(0, numDecksToBeAddedTo)
      .map((deckId) => ({ cardId: id, deckId }));
    cardsToDecksToInsert.push(...decksToAddCardTo);
  }
  await db.insert(cardsToDecks).values(cardsToDecksToInsert);
  console.log(
    success`Seeded ${cardsToDecksToInsert.length} mappings between cards and decks`,
  );
}

main();
