import {
  getReviewDateForEachRating,
  gradeCard,
  parseCardDate,
  stringifyCardDate,
} from '@/utils/fsrs';
import { ReactQueryOptions, trpc } from '@/utils/trpc';
import { endOfDay, isBefore } from 'date-fns';
import { produce } from 'immer';
import { toast } from 'sonner';

type GradeMutationOptions = ReactQueryOptions['card']['grade'];
type GradeMutation = ReturnType<typeof trpc.card.grade.useMutation>;

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

      const cardToBeReviewedToday = isBefore(day, endOfDay(new Date()));

      const nextCards = produce(allCards, (draft) => {
        const cardIndex = draft.findIndex((card) => card.cards.id === id);
        const cardNotFound = cardIndex === -1;
        if (cardNotFound) return;

        if (cardToBeReviewedToday) {
          const nextCard = stringifyCardDate(
            gradeCard(parseCardDate(card.cards), grade)
          );
          draft[cardIndex].cards = {
            ...draft[cardIndex].cards,
            ...nextCard,
          };

          draft.sort((a, b) => (isBefore(a.cards.due, b.cards.due) ? -1 : 1));
          return;
        }

        // We're allowed to return in Immer
        // https://immerjs.github.io/immer/return
        return draft.filter((card) => card.cards.id !== id);
      });

      utils.card.all.setData(undefined, nextCards);

      return { previousCards: allCards };
    },

    async onError(err, _variables, context) {
      console.error(err.message);
      toast.error(err.message);

      if (context?.previousCards) {
        utils.card.all.setData(undefined, context.previousCards);
      }
    },
  });
}
