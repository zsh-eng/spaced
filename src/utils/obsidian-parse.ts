// Obsidian spaced repetition uses a simple parser.
// Multiline cards are separated by a separator "?" or "??".
// The front and back of the card are the line before and after the separator,
// until the next newline or the end of the file.
// We don't use the same parser as `obsidian-spaced-repetition` as that is
// overkill for extracting the cards.

import { type CreateManyMutationInput } from "@/hooks/card/use-create-many-card";

const MULTILINE_SEPARATOR = "?";

export function extractCardContentFromMarkdownString(
  markdown: string,
): CreateManyMutationInput["cardInputs"] {
  const mdReplacedNewlines = markdown.replace(/\r\n/g, "\n");
  const lines = mdReplacedNewlines.split("\n");

  const contents = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line !== MULTILINE_SEPARATOR) {
      continue;
    }

    const question = lines[i - 1];
    const answer = lines[i + 1];

    if (!question || !answer) {
      continue;
    }

    contents.push({ question, answer });
  }

  return contents;
}
