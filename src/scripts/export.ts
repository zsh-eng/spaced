import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { extractCardContentFromMarkdownString } from "@/utils/obsidian-parse";

async function getFilenamesWithExtension(
  folder: string,
  callback: (filename: string) => void,
  extension: string = "",
) {
  const files = await fs.readdir(folder);

  for (const file of files) {
    const filePath = path.join(folder, file);
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      await getFilenamesWithExtension(filePath, callback, extension);
      continue;
    }

    const isTargetFile = file.endsWith(extension);
    if (!isTargetFile) {
      continue;
    }

    callback(filePath);
  }
}

// We want to transform the data into the following format.
// Tags -> deck name
// The deck names are transformed to a generated UUID
// The cards in the deck are generated with a Q/A format
// Each card has a deckIds field that contains the UUID of the deck
type Card = {
  question: string;
  answer: string;
  deckIds: string[];
};

type ExportDataJson = {
  decks: string[];
  cards: Card[];
};

const pathToMetadata = path.resolve(
  __dirname,
  "..",
  "..",
  "data",
  "metadata.json",
);

async function readMetadata(): Promise<{
  folder: string;
  tags: string[];
}> {
  const metadata = await fs.readFile(pathToMetadata, "utf-8");
  const parsed = JSON.parse(metadata);
  if (!parsed.folder) {
    throw new Error("Folder not found in metadata.json");
  }

  if (!Array.isArray(parsed.tags)) {
    throw new Error("Tags not found in metadata.json");
  }

  return parsed;
}

/**
 * Exports cards from markdown files to a JSON file.
 * The JSON file contains the decks and cards in the format
 *
 * Add the path to your Obsidian vault in the `metadata.json` file.
 *
 * @example
 * ```json
 * {
 *  "folder": "/path/to/your/obsidian/vault",
 *  "tags": ["deck1", "deck2", "deck3"]
 * }
 * ```
 */
async function main() {
  const filenames: string[] = [];
  const { folder, tags } = await readMetadata();

  await getFilenamesWithExtension(
    folder,
    (filename) => filenames.push(filename),
    ".md",
  );

  const decks = new Set<string>(tags);
  const allCards: Card[] = [];

  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i];
    try {
      const markdownString = await fs.readFile(filename, "utf-8");
      const parsed = matter(markdownString);

      // We don't create cards if there are no decks
      if (!parsed?.data?.tags) {
        continue;
      }

      const tags: string[] = parsed.data.tags?.filter(
        (tag: unknown): tag is string =>
          typeof tag === "string" && decks.has(tag),
      );

      if (tags.length === 0) {
        continue;
      }

      const cards = extractCardContentFromMarkdownString(parsed.content);
      const cardsWithDeck: Card[] = cards.map((card) => ({
        ...card,
        deckIds: tags,
      }));

      allCards.push(...cardsWithDeck);
    } catch (err) {
      console.error(`Error while reading ${filename}: ${err}`);
    }
  }

  const exportData: ExportDataJson = {
    decks: [...decks],
    cards: allCards,
  };

  const currentDir = path.resolve(__dirname);
  await fs.writeFile(
    path.join(currentDir, "..", "..", "data", "export.json"),
    JSON.stringify(exportData, null, 2),
  );

  console.log(`Exported ${allCards.length} cards to ${currentDir}`);
}

main();
