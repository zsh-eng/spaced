'use client';

import Flashcard from '@/components/flashcard/flashcard';
import { Card, CardContent, Rating } from '@/schema';
import { useState } from 'react';

type Props = {
  cardContentWithCards: Array<
    CardContent & {
      card: Card;
    }
  >;
};

export default function FlashcardBox({ cardContentWithCards }: Props) {
  const [index, setIndex] = useState(0);
  const card = cardContentWithCards[index];
  const isCard = !!card;

  // TODO implement ts-fsrs-logic
  const onRating = (rating: Rating) => {
    console.log(`Rating: ${rating}, ${index}`);
    setIndex((index) => index + 1);
  };

  return (
    isCard && (
      <Flashcard card={card.card} cardContent={card} onRating={onRating} />
    )
  );
}
