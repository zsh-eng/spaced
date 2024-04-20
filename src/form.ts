import { z } from "zod";

// Form schemas are shared between the client and the server.
// This ensures that the inputs are validated on both ends.

const MAX_INPUT_LENGTH = 20000;

// Card Content
export const cardContentFormSchema = z.object({
  question: z
    .string()
    .min(1, {
      message: "Question is required.",
    })
    .max(MAX_INPUT_LENGTH, {
      message: "Question is too long.",
    }),
  answer: z
    .string()
    .min(1, {
      message: "Answer is required.",
    })
    .max(MAX_INPUT_LENGTH, {
      message: "Answer is too long.",
    }),
});

export type CardContentFormValues = z.infer<typeof cardContentFormSchema>;

export const cardContentDefaultValues = {
  question: "",
  answer: "",
} satisfies CardContentFormValues;

// Create Card
export const createCardFormSchema = cardContentFormSchema.extend({
  deckIds: z.array(z.string().uuid()).optional(),
});

export type CreateCardFormValues = z.infer<typeof createCardFormSchema>;

export const createCardDefaultValues = {
  ...cardContentDefaultValues,
  deckIds: [],
} satisfies CreateCardFormValues;

// Create Many Cards
export const createManyCardsFormSchema = z.object({
  cardInputs: z.array(cardContentFormSchema).min(1),
  deckIds: z.array(z.string().uuid()).optional(),
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
