import db from "@/db";
import {
  NewCard,
  NewCardContent,
  NewCardsToDecks,
  NewDeck,
  NewReviewLog,
  NewUserMedia,
  cardContents,
  cards,
  cardsToDecks,
  decks,
  ratings,
  reviewLogs,
  userMedia,
} from "@/schema";
import { wipeDatabase } from "@/scripts/utils";
import { success } from "@/utils/format";
import { gradeCard, mergeFsrsCard, newCard, newCardToCard } from "@/utils/fsrs";
import { faker } from "@faker-js/faker";
import { add, isBefore, sub } from "date-fns";
import { createEmptyCard } from "ts-fsrs";
import { Card, CardContent, ReviewLog } from "../schema";

// Data generated using the faker-js library.
// See https://fakerjs.dev/api/

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

function generateNewDeck(userId: string, newDeck?: Partial<NewDeck>): NewDeck {
  return {
    id: crypto.randomUUID(),
    name: faker.lorem.word({
      length: { min: 1, max: 5 },
    }),
    description: faker.lorem.paragraph(),
    ...newDeck,
    userId: userId,
  };
}

/**
 * Simulates the card and the reviews for the card.
 * @returns A tuple of the card and the review logs for the card.
 *
 */
function simulateNewCardAndReviews(
  id: string,
  userId: string,
): [Card, NewReviewLog[]] {
  const seedCard: Card = newCardToCard(newCard(userId));
  const cardCreatedDate = faker.date.past({ years: 1 });
  seedCard.createdAt = cardCreatedDate;
  seedCard.id = id;

  const fsrsCard = createEmptyCard(cardCreatedDate);
  const card = mergeFsrsCard(fsrsCard, seedCard);

  let currentCard = card;
  const now = new Date();
  const twentyDaysAgo = sub(now, { days: 20 });
  const validRatings = ratings.filter(
    (rating) => rating !== "Manual" && rating !== "Again",
  );
  const logs: NewReviewLog[] = [];

  while (isBefore(currentCard.due, twentyDaysAgo)) {
    // 50% of reviewing the card on due date, rest is within the next 10 days
    const reviewDate =
      Math.random() > 0.5
        ? currentCard.due
        : faker.date.between({
            from: currentCard.due,
            to: add(currentCard.due, { days: 10 }),
          });

    // Randomly choose a grade - we're excluding "Manual" and "Again" ratings
    const { nextCard, reviewLog } = gradeCard(
      currentCard,
      faker.helpers.arrayElement(validRatings),
      reviewDate,
    );
    currentCard = nextCard;
    logs.push(reviewLog);
    // console.log(
    //   success`Simulated review log ${logs.length} for card ${currentCard.id}. Next date is ${currentCard.due}`,
    // );
  }

  return [currentCard, logs];
}

function generateDummyImageUrl(): string {
  const randomInt = faker.number.int({ min: 1, max: 300 });
  return `https://picsum.photos/id/${randomInt}/512/512`;
}

/**
 * Seed the database with some random data.
 * Note that this script can take a while to run since we're inserting data into the Turso database.
 *
 * Each {@link Card} has a corresponding {@link CardContent} and {@link ReviewLog}.
 */
async function main() {
  await wipeDatabase();
  const userId = process.env.SEED_USER_ID;
  if (!userId) {
    throw new Error("SEED_USER_ID environment variable is not set");
  }

  console.log("Seeding database with 10 decks");
  const decksToCreate = 10;
  const decksToInsert = Array.from({ length: decksToCreate }, () =>
    generateNewDeck(userId),
  );
  await db.insert(decks).values(decksToInsert);
  console.log(success`Seeded database with ${decksToCreate} decks`);
  const deckIds = decksToInsert.map((deck) => deck.id);

  const itemsToCreate = 2000;
  // Seeding too many items will cause error with Turso for too many SQL variables
  const skip = 250;
  const cardIds = Array.from({ length: itemsToCreate }, () =>
    crypto.randomUUID(),
  );

  console.log("Seeding database with", itemsToCreate, "items");
  for (let i = 0; i < itemsToCreate; i += skip) {
    const cardsToInsert: NewCard[] = [];
    const cardContentsToInsert: NewCardContent[] = [];
    const reviewLogsToInsert: NewReviewLog[] = [];

    for (let j = 0; j < Math.min(skip, itemsToCreate); j++) {
      const id = cardIds[i + j];
      const [card, reviewLogs] = simulateNewCardAndReviews(id, userId);
      const cardContent = generateNewCardContent(card.id);

      cardsToInsert.push(card);
      cardContentsToInsert.push(cardContent);
      reviewLogsToInsert.push(...reviewLogs);
      // console.log(success`Seeded item ${i + j + 1}`);
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

  console.log("Seeding images");
  const imagesToInsert: NewUserMedia[] = Array.from({ length: 100 }, () => ({
    id: crypto.randomUUID(),
    userId,
    url: generateDummyImageUrl(),
  }));
  await db.insert(userMedia).values(imagesToInsert);
  console.log(success`Seeded ${imagesToInsert.length} images`);
}

main();
