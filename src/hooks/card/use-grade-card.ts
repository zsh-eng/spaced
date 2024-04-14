import { getReviewDateForEachRating, gradeCard } from "@/utils/fsrs";
import { ReactQueryOptions, trpc } from "@/utils/trpc";
import { endOfDay, isBefore } from "date-fns";
import { produce } from "immer";
import { toast } from "sonner";

type GradeMutationOptions = ReactQueryOptions["card"]["grade"];
type GradeMutation = ReturnType<typeof trpc.card.grade.useMutation>;

const THRESHOLD_FOR_REFETCH = 10;

/**
 * Hook to grade a card.
 */
export function useGradeCard(options?: GradeMutationOptions): GradeMutation {
  const utils = trpc.useUtils();

  return trpc.card.grade.useMutation({
    ...options,
    async onMutate({ grade, id }) {
      await utils.card.all.cancel();
      const allCards = utils.card.all.getData();

      if (!allCards) {
        return;
      }

      const card = allCards.find((card) => card.cards.id === id);
      if (!card) {
        return;
      }

      const reviewDay = getReviewDateForEachRating(card.cards);
      const day = reviewDay[grade];
      const isCardToBeReviewedAgainToday = isBefore(day, endOfDay(new Date()));
      const nextCard = gradeCard(card.cards, grade);

      // Update the cards in the cache
      const nextCards = produce(allCards, (draft) => {
        const cardIndex = draft.findIndex((card) => card.cards.id === id);
        const cardNotFound = cardIndex === -1;
        if (cardNotFound) return;
        if (!isCardToBeReviewedAgainToday) {
          // We're allowed to return in Immer
          // https://immerjs.github.io/immer/return
          return draft.filter((card) => card.cards.id !== id);
        }

        draft[cardIndex].cards = {
          ...draft[cardIndex].cards,
          ...nextCard,
        };
        draft.sort((a, b) => (isBefore(a.cards.due, b.cards.due) ? -1 : 1));
        return;
      });
      utils.card.all.setData(undefined, nextCards);

      const stats = utils.card.stats.getData();
      if (!stats) {
        return { previousCards: allCards };
      }

      // Update the stats in the cache
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

        if (!isCardToBeReviewedAgainToday) return;

        switch (nextCard.state) {
          case "New":
            draft.new++;
            break;
          case "Learning":
          case "Relearning":
            draft.learning++;
            break;
          case "Review":
            draft.review++;
            break;
        }
        draft.total++;
      });
      utils.card.stats.setData(undefined, nextStats);

      return { previousCards: allCards, previousStats: stats };
    },

    async onSuccess() {
      const cards = utils.card.all.getData();
      // Refetch periodically to get more cards
      // We don't use infinite queries here because there is no pagination
      // As we grade cards, new cards will be returned from the server
      if (!cards || cards.length > THRESHOLD_FOR_REFETCH) return;

      await utils.card.all.invalidate();
    },

    async onError(err, _variables, context) {
      console.error(err.message);
      toast.error(err.message);

      if (context?.previousCards) {
        utils.card.all.setData(undefined, context.previousCards);
      }

      if (context?.previousStats) {
        utils.card.stats.setData(undefined, context.previousStats);
      }
    },
  });
}
