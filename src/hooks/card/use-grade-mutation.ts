import { getReviewDayForEachRating } from '@/utils/fsrs';
import { ReactQueryOptions, trpc } from '@/utils/trpc';
import { endOfDay, isBefore } from 'date-fns';

type GradeMutationOptions = ReactQueryOptions['card']['grade'];

export function useGradeMutation(options?: GradeMutationOptions) {
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

      const reviewDay = getReviewDayForEachRating(card.cards);
      const day = reviewDay[grade];

      if (isBefore(day, endOfDay(new Date()))) {
        const nextCards = allCards
          .map((card) => {
            if (card.cards.id === id) {
              return {
                ...card,
                cards: {
                  ...card.cards,
                  due: day.toISOString(),
                },
              };
            }

            return card;
          })
          .sort((a, b) => (isBefore(a.cards.due, b.cards.due) ? -1 : 1));

        utils.card.all.setData(undefined, nextCards);
      } else {
        const nextCards = allCards.filter((card) => card.cards.id !== id);
        utils.card.all.setData(undefined, nextCards);
      }
    },
  });
}
