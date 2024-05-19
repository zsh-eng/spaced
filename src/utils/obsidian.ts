import { z } from "zod";

/**
 * The origin for the Obsidian app.
 */
export const OBSIDIAN_ORIGIN = "app://obsidian.md";

export type MessageEventWithSource = MessageEvent & {
  source: MessageEventSource;
};

export function isMessageEventFromObsidian(
  event: MessageEvent,
): event is MessageEventWithSource {
  if (event.origin !== OBSIDIAN_ORIGIN) {
    console.warn("Received message from unknown origin:", event.origin);
    return false;
  }

  const canPostMessage = event.source && "postMessage" in event.source;
  if (!canPostMessage) {
    console.warn("Unable to post message to parent");
    return false;
  }

  return true;
}

export const OBSIDIAN_ACTION = {
  GET_CURRENT_CARD: "get-current-card",
  INSERT_CARDS: "insert-cards",
  UPDATE_FRONT: "update-front",
  UPDATE_BACK: "update-back",
} as const;

const OBSIDIAN_ACTION_TYPES = [
  OBSIDIAN_ACTION.GET_CURRENT_CARD,
  OBSIDIAN_ACTION.INSERT_CARDS,
  OBSIDIAN_ACTION.UPDATE_FRONT,
  OBSIDIAN_ACTION.UPDATE_BACK,
] as const;

export type ObsidianAction = (typeof OBSIDIAN_ACTION_TYPES)[number];

const getCurrentCardSchema = z.object({
  action: z.literal(OBSIDIAN_ACTION.GET_CURRENT_CARD),
  data: z.unknown().optional(),
});
const insertCardsSchema = z.object({
  action: z.literal(OBSIDIAN_ACTION.INSERT_CARDS),
  data: z.object({
    content: z.string(),
    filename: z.string(),
    tags: z.array(z.string()),
    id: z.string(),
  }),
});
const updateFrontSchema = z.object({
  action: z.literal(OBSIDIAN_ACTION.UPDATE_FRONT),
  data: z.string(),
});
const updateBackSchema = z.object({
  action: z.literal(OBSIDIAN_ACTION.UPDATE_BACK),
  data: z.string(),
});

export const obsidianActionRequestSchema = z.discriminatedUnion("action", [
  getCurrentCardSchema,
  insertCardsSchema,
  updateFrontSchema,
  updateBackSchema,
]);

export type ObsidianActionRequest = z.infer<typeof obsidianActionRequestSchema>;

export const obsidianActionResponseSchema = z.object({
  success: z.boolean(),
  action: z.enum(OBSIDIAN_ACTION_TYPES),
  data: z.unknown().optional(),
});
export type ObsidianActionResponse = z.infer<
  typeof obsidianActionResponseSchema
>;
