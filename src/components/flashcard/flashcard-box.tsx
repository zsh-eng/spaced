'use client';

import Flashcard from '@/components/flashcard/flashcard';
import { Card, CardContent, type Rating } from '@/schema';
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
  const isCard = !!cardContentWithCard;

  // TODO implement ts-fsrs-logic
  const onRating = (rating: Rating) => {
    toast(`Card marked as ${rating}`, {
      action: {
        label: 'Undo',
        onClick: () => {},
      },
    });
    console.log(`Rating: ${rating}, ${index}`);
    setIndex((index) => index + 1);
    setOpen(false);
  };

  return (
    isCard && (
      <Flashcard
        card={cardContentWithCard.card}
        cardContent={cardContentWithCard}
        onRating={onRating}
        open={open}
        onOpen={() => setOpen(true)}
      />
    )
  );
}
