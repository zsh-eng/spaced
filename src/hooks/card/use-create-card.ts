import { ReactQueryOptions, trpc } from "@/utils/trpc";
import { toast } from "sonner";

type CreateMutationOptions = ReactQueryOptions["card"]["create"];
type CreateMutation = ReturnType<typeof trpc.card.create.useMutation>;

/**
 * Hook to create a card.
 */
export function useCreateCard(options?: CreateMutationOptions): CreateMutation {
  const utils = trpc.useUtils();

  return trpc.card.create.useMutation({
    ...options,
    onSuccess: async (data) => {
      await utils.card.all.cancel();

      const allCards = utils.card.all.getData();
      if (!allCards) {
        return;
      }

      // Put the new card at the end of the deck
      const nextCards = [...allCards, data];
      utils.card.all.setData(undefined, nextCards);
      toast.success("Card created.");

      return { previousCards: allCards };
    },

    onError: (error) => {
      console.error(error.message);
      toast.error("Failed to create card");
    },
  });
}
