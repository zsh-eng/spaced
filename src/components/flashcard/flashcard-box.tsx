'use client';

import Flashcard from '@/components/flashcard/flashcard';
import { Card, CardContent, type Rating } from '@/schema';
import { getReviewDayForEachRating } from '@/utils/fsrs';
import { trpc } from '@/utils/trpc';
import { endOfDay, intlFormatDistance, isBefore } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {};

export default function FlashcardBox({}: Props) {
  const [open, setOpen] = useState(false);
  const { data: cardsWithContent = [], isLoading } = trpc.card.all.useQuery();
  const utils = trpc.useUtils();
  const gradeMutation = trpc.card.grade.useMutation({
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
        // Bring it back
        console.log('Bringing it back');
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
        // Filter it out
        console.log('Filtering it out');
        const nextCards = allCards.filter((card) => card.cards.id !== id);
        utils.card.all.setData(undefined, nextCards);
      }
    },
  });

  if (isLoading || cardsWithContent.length === 0) {
    return <div>Loading...</div>;
  }

  const { cards: card, card_contents: cardContent } = cardsWithContent[0]!;
  const schemaRatingToReviewDay = getReviewDayForEachRating(card);
  const isCard = card && cardContent;

  const onRating = (rating: Rating) => {
    const reviewDay = schemaRatingToReviewDay[rating];

    console.log(`Current card: ${card.id}`);
    console.log(`Next Card: ${cardsWithContent[1]?.cards.id}`);

    gradeMutation.mutate({
      grade: rating,
      id: card.id,
    });
    toast(`Card marked as ${rating}.`, {
      action: {
        label: 'Undo',
        onClick: () => {},
      },
      description: `You'll see this again ${intlFormatDistance(
        reviewDay,
        new Date()
      )}`,
    });
    console.log(`Rating: ${rating}`);
    setOpen(false);
  };

  return (
    <div className='py-16'>
      {isCard && (
        <Flashcard
          card={card}
          cardContent={cardContent as CardContent}
          onRating={onRating}
          open={open}
          onOpen={() => setOpen(true)}
          schemaRatingToReviewDay={schemaRatingToReviewDay}
        />
      )}
    </div>
  );
}
