import { ReactQueryOptions, trpc } from "@/utils/trpc";
import { produce } from "immer";
import { toast } from "sonner";

type DeleteMutationOptions = ReactQueryOptions["card"]["delete"];
type DeleteMutation = ReturnType<typeof trpc.card.delete.useMutation>;

/**
 * Hook to delete a card.
 */
export function useDeleteCard(options?: DeleteMutationOptions): DeleteMutation {
  const utils = trpc.useUtils();
  return trpc.card.delete.useMutation({
    ...options,
    onMutate: async (id: string) => {
      await utils.card.all.cancel();
      const allCards = utils.card.all.getData();

      if (!allCards) {
        return;
      }

      const nextCards = produce(allCards, (draft) => {
        return draft.filter((card) => card.cards.id !== id);
      });
      utils.card.all.setData(undefined, nextCards);

      toast.success("Card deleted.");

      return { previousCards: allCards };
    },

    onError: (error, _variables, context) => {
      console.error(error.message);
      toast.error("Failed to delete card");

      if (context?.previousCards) {
        utils.card.all.setData(undefined, context.previousCards);
      }
    },
  });
}
