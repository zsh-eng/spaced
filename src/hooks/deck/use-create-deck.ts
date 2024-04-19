import { type Deck } from "@/schema";
import { ReactQueryOptions, trpc } from "@/utils/trpc";

type CreateMutationOptions = ReactQueryOptions["deck"]["create"];
type CreateMutation = ReturnType<typeof trpc.deck.create.useMutation>;

/**
 * Hook to create a {@link Deck}
 */
export function useCreateDeck(options?: CreateMutationOptions): CreateMutation {
  const utils = trpc.useUtils();

  return trpc.deck.create.useMutation({
    ...options,
    onSuccess: async () => {
      await utils.card.sessionData.invalidate();
    },

    onError: (error) => {
      console.error(error.message);
    },
  });
}
