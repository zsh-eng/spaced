import { newCardWithContent, stringifyCardDate } from "@/utils/fsrs";
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
    onMutate: async ({ question, answer }) => {
      await utils.card.all.cancel();

      const allCards = utils.card.all.getData();
      if (!allCards) {
        return;
      }

      const newCard = newCardWithContent(question, answer);
      const newCardWithDateString = {
        cards: stringifyCardDate(newCard.card),
        card_contents: newCard.cardContent,
      };
      const nextCards = [...allCards, newCardWithDateString];
      utils.card.all.setData(undefined, nextCards);
      toast.success("Card created.");

      return { previousCards: allCards };
    },

    onError: (error, _variables, context) => {
      console.error(error.message);
      toast.error("Failed to create card");

      if (context?.previousCards) {
        utils.card.all.setData(undefined, context.previousCards);
      }
    },
  });
}
