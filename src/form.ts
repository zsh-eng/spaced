import { RouterInputs } from "@/utils/trpc";
import { z } from "zod";

const MAX_INPUT_LENGTH = 20000;

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
