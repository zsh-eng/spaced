'use client';

import Flashcard from '@/components/flashcard/flashcard';
import { getReviewDayForEachRating } from '@/lib/fsrs';
import { Card, CardContent, type Rating } from '@/schema';
import { intlFormatDistance } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  cardContentWithCards: Array<
    CardContent & {
      card: Card;
    }
  >;
};

export default function FlashcardBox({ cardContentWithCards }: Props) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const cardContentWithCard = cardContentWithCards[index];
  const card = cardContentWithCard.card;
  const isCard = !!cardContentWithCard;

  const schemaRatingToReviewDay = getReviewDayForEachRating(card);

  // TODO implement ts-fsrs-logic
  const onRating = (rating: Rating) => {
    const reviewDay = schemaRatingToReviewDay[rating];

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
    console.log(`Rating: ${rating}, ${index}`);
    setIndex((index) => index + 1);
    setOpen(false);
  };

  return (
    <div className='py-16'>
      {isCard && (
        <Flashcard
          card={card}
          cardContent={cardContentWithCard}
          onRating={onRating}
          open={open}
          onOpen={() => setOpen(true)}
          schemaRatingToReviewDay={schemaRatingToReviewDay}
        />
      )}
    </div>
  );
}
