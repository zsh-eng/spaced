import path from "path";
import fs from "node:fs/promises";
import z from "zod";
import db from "@/db";
import { NewDeck, cardContents, cards, cardsToDecks, decks } from "@/schema";
import { success } from "@/utils/format";
import { newCardWithContent } from "@/utils/fsrs";

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
  const stat = await fs.stat(filename);
  if (!stat.isFile()) {
    throw new Error(`File ${filename} does not exist`);
  }

  const file = await fs.readFile(filename, "utf-8");
  const data = JSON.parse(file);
  const parsed = schema.parse(data);

  console.log(`Importing ${parsed.decks.length} decks`);
  const decksToInsert = parsed.decks.map((deck) => ({
    id: crypto.randomUUID(),
    name: deck,
  })) satisfies NewDeck[];
  await db.insert(decks).values(decksToInsert);
  console.log(success`Imported ${parsed.decks.length} decks`);

  console.log(`Importing ${parsed.cards.length} cards`);
  const batchSize = 250;

  for (let i = 0; i < parsed.cards.length; i += batchSize) {
    const slicedCards = parsed.cards.slice(i, i + batchSize);
    const cardWithContents = slicedCards.map((card) => ({
      ...newCardWithContent(card.question, card.answer),
      deckIds: card.deckIds,
    }));

    const cardsToInsert = cardWithContents.map(({ card }) => card);
    const cardContentsToInsert = cardWithContents.map(
      ({ cardContent }) => cardContent,
    );
    const cardsToDecksToInsert = cardWithContents.flatMap(({ card, deckIds }) =>
      deckIds.map((deckId) => ({ cardId: card.id, deckId })),
    );

    await db.insert(cards).values(cardsToInsert);
    await db.insert(cardContents).values(cardContentsToInsert);
    await db.insert(cardsToDecks).values(cardsToDecksToInsert);
    console.log(
      success`Imported ${i + 1}-${Math.min(i + batchSize, parsed.cards.length)} cards`,
    );
  }
  console.log(success`Imported ${parsed.cards.length} cards`);
}

main();
