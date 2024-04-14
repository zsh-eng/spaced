import { type Deck } from "@/schema";
import { ReactQueryOptions, trpc } from "@/utils/trpc";

type DeleteMutationOptions = ReactQueryOptions["deck"]["delete"];
type DeleteMutation = ReturnType<typeof trpc.deck.delete.useMutation>;

/**
 * Hook to delete a {@link Deck}.
 */
export function useDeleteDeck(options?: DeleteMutationOptions): DeleteMutation {
  const utils = trpc.useUtils();
  return trpc.deck.delete.useMutation({
    ...options,

    onSuccess: () => {
      utils.deck.all.invalidate();
    },

    onError(error) {
      console.error(error.message);
    },
  });
}
