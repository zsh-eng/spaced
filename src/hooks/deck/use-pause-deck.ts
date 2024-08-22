import { type Deck } from "@/schema";
import { ReactQueryOptions, trpc } from "@/utils/trpc";

type PauseMutationOptions = ReactQueryOptions["deck"]["pause"];
type PauseMutation = ReturnType<typeof trpc.deck.pause.useMutation>;

/**
 * Pauses all the cards in a {@link Deck}.
 */
export function usePauseDeck(options?: PauseMutationOptions): PauseMutation {
  const utils = trpc.useUtils();
  return trpc.deck.pause.useMutation({
    ...options,

    onSuccess: () => {
      utils.deck.all.invalidate();
      utils.deck.infiniteCards.invalidate();
    },

    onError(error) {
      console.error(error.message);
    },
  });
}
