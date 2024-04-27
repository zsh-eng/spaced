import path from "path";
import fs from "node:fs/promises";
import z from "zod";
import db from "@/db";
import { NewDeck, cardContents, cards, cardsToDecks, decks } from "@/schema";
import { success } from "@/utils/format";
import { newCardWithContent } from "@/utils/fsrs";
import _ from "lodash";

const currentDir = path.resolve(__dirname);
const filename = path.join(currentDir, "..", "..", "data", "export.json");

const schema = z.object({
  decks: z.array(z.string()),
  cards: z.array(
    z.object({
      deckIds: z.array(z.string()),
      question: z.string(),
      answer: z.string(),
    }),
  ),
});

async function main() {
  const userId = process.env.SEED_USER_ID;
  if (!userId) {
    throw new Error("SEED_USER_ID is not set");
  }

  const stat = await fs.stat(filename);
  if (!stat.isFile()) {
    throw new Error(`File ${filename} does not exist`);
  }

  const file = await fs.readFile(filename, "utf-8");
  const data = JSON.parse(file);
  const parsed = schema.parse(data);

  console.log(`Importing ${parsed.decks.length} decks`);
  const decksToInsert = parsed.decks.map((deck) => ({
    userId,
    id: crypto.randomUUID(),
    name: deck,
  })) satisfies NewDeck[];
  await db.insert(decks).values(decksToInsert);
  const deckNameToDeckId: Record<string, string> = decksToInsert.reduce<
    Record<string, string>
  >((acc, deck) => {
    acc[deck.name] = deck.id;
    return acc;
  }, {});
  console.log(success`Imported ${parsed.decks.length} decks`);

  console.log(`Importing ${parsed.cards.length} cards`);
  const batchSize = 250;

  // As new cards are displayed in order of creation date, this will help
  // ensure that the cards are in a somewhat random order
  const randomisedCards = _.shuffle(parsed.cards);

  for (let i = 0; i < randomisedCards.length; i += batchSize) {
    const slicedCards = randomisedCards.slice(i, i + batchSize);

    const cardWithContents = slicedCards.map((card) => ({
      ...newCardWithContent(userId, card.question, card.answer),
      deckNames: card.deckIds,
    }));
    const cardsToInsert = cardWithContents.map(({ card }) => card);
    const cardContentsToInsert = cardWithContents.map(
      ({ cardContent }) => cardContent,
    );
    const cardsToDecksToInsert = cardWithContents.flatMap(
      ({ card, deckNames }) =>
        deckNames.map((name) => ({
          cardId: card.id,
          deckId: deckNameToDeckId[name],
        })),
    );

    await db.insert(cards).values(cardsToInsert);
    await db.insert(cardContents).values(cardContentsToInsert);
    await db.insert(cardsToDecks).values(cardsToDecksToInsert);
    console.log(
      success`Imported ${i + 1}-${Math.min(i + batchSize, randomisedCards.length)} cards`,
    );
  }
  console.log(success`Imported ${randomisedCards.length} cards`);
}

main();
