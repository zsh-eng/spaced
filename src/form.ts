import { states } from "@/schema";
import { z } from "zod";

// Form schemas are shared between the client and the server.
// This ensures that the inputs are validated on both ends.

const MAX_INPUT_LENGTH = 20000;

export type ObsidianCardMetadata = {
  tags: string[];
  filename: string;
  source: "obsidian";
  sourceId: string;
};

export const obsidianCardMetadataSchema = z.object({
  tags: z.array(z.string()),
  filename: z.string(),
  source: z.literal("obsidian"),
  sourceId: z.string(),
});

export const cardMetadataSchema = z.discriminatedUnion("source", [
  obsidianCardMetadataSchema,
]);
export type CardMetadata = z.infer<typeof cardMetadataSchema>;

// Card Content
export const cardContentFormSchema = z.object({
  question: z
    .string()
    .min(1, {
      message: "Question is required.",
    })
    .max(MAX_INPUT_LENGTH, {
      message: "Question is too long.",
    }).describe("The question for the flashcard."),
  answer: z
    .string()
    .min(1, {
      message: "Answer is required.",
    })
    .max(MAX_INPUT_LENGTH, {
      message: "Answer is too long.",
    }).describe("The answer for the flashcard."),
});

export type CardContentFormValues = z.infer<typeof cardContentFormSchema>;

export const aiCardOutputSchema = z.object({
  cards: z.array(cardContentFormSchema).describe("The flashcards to be generated.")
})
/**
 * The output of the LLM generating flashcards.
 */
export type AICardOutput = z.infer<typeof aiCardOutputSchema>;

export const cardContentDefaultValues = {
  question: "",
  answer: "",
} satisfies CardContentFormValues;

// Create Card
export const createCardFormSchema = cardContentFormSchema.extend({
  deckIds: z.array(z.string().uuid()).optional(),
  metadata: cardMetadataSchema.optional(),
});

export type CreateCardFormValues = z.infer<typeof createCardFormSchema>;

export const updateCardFormSchema = cardContentFormSchema.extend({
  cardContentId: z.string().uuid(),
})

export type UpdateCardFormValues = z.infer<typeof updateCardFormSchema>;

export const createCardDefaultValues = {
  ...cardContentDefaultValues,
  deckIds: [],
} satisfies CreateCardFormValues;

// Create Many Cards
export const createManyCardsFormSchema = z.object({
  cardInputs: z.array(cardContentFormSchema).min(1),
  deckIds: z.array(z.string().uuid()).optional(),
  metadata: cardMetadataSchema.optional(),
});

export type CreateManyCardsFormValues = z.infer<
  typeof createManyCardsFormSchema
>;

export const createManyCardsDefaultValues = {
  cardInputs: [],
  deckIds: [],
} satisfies CreateManyCardsFormValues;

// Create Deck
export const deckFormSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Name is required.",
    })
    .max(50, {
      message: "Name is too long.",
    }),
  description: z.string().max(MAX_INPUT_LENGTH, {
    message: "Description is too long.",
  }),
});

export type DeckFormValues = z.infer<typeof deckFormSchema>;

export const deckDefaultValues = {
  name: "",
  description: "",
} satisfies DeckFormValues;

// Manual grading
export const cardSchema = z.object({
  id: z.string(),
  due: z.date(),
  stability: z.number(),
  difficulty: z.number(),
  elapsed_days: z.number(),
  scheduled_days: z.number(),
  reps: z.number(),
  lapses: z.number(),
  state: z.enum(states),
  last_review: z.date().nullable(),
});
