import { getReviewDateForEachRating, gradeCard } from "@/utils/fsrs";
import Sorts from "@/utils/sort";
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
      const { nextCard } = gradeCard(card.cards, grade);

      // Update the cards in the cache
      const allCardsWithoutGradedCard = allCards.filter(
        (card) => card.cards.id !== id,
      );
      const nextCards = isCardToBeReviewedAgainToday
        ? [
            ...allCardsWithoutGradedCard,
            {
              cards: nextCard,
              card_contents: card.card_contents,
            },
          ]
        : allCardsWithoutGradedCard;
      nextCards.sort((a, b) => Sorts.DIFFICULTY_ASC.fn(a.cards, b.cards));
      utils.card.all.setData(undefined, nextCards);

      // Update the stats in the cache
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
