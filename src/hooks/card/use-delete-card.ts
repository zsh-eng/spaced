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
  const undo = trpc.card.undoDelete.useMutation();

  return trpc.card.delete.useMutation({
    ...options,
    onMutate: async (id: string) => {
      await utils.card.all.cancel();
      await utils.card.stats.cancel();

      const allCards = utils.card.all.getData();
      const card = allCards?.find((card) => card.cards.id === id);

      if (!allCards || !card) {
        return;
      }

      const nextCards = produce(allCards, (draft) => {
        return draft.filter((card) => card.cards.id !== id);
      });
      utils.card.all.setData(undefined, nextCards);

      const stats = utils.card.stats.getData();
      if (!stats) {
        return { previousCards: allCards };
      }

      const nextStats = produce(stats, (draft) => {
        switch (card.cards.state) {
          case "New":
            draft.new--;
            break;
          case "Learning":
          case "Relearning":
            draft.learning--;
            break;
          case "Review":
            draft.review--;
            break;
        }
        draft.total--;
      });
      utils.card.stats.setData(undefined, nextStats);

      // Currently, I place this undo functionality here because
      // The previous values are readily available
      // I'm not sure what the best approach is, especially if we click on an older toast
      toast.success("Card deleted.", {
        action: {
          label: "Undo",
          onClick: () => {
            undo.mutate(id);
            utils.card.all.setData(undefined, allCards);
            utils.card.stats.setData(undefined, stats);
          },
        },
      });

      return { previousCards: allCards, previousStats: stats };
    },

    onSuccess: () => {
      utils.card.all.refetch();
      utils.card.stats.refetch();
    },

    onError: (error, _variables, context) => {
      console.error(error.message);

      if (context?.previousCards) {
        utils.card.all.setData(undefined, context.previousCards);
      }

      if (context?.previousStats) {
        utils.card.stats.setData(undefined, context.previousStats);
      }
    },
  });
}
