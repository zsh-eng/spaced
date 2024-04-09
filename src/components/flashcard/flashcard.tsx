'use client';

import { CardContent, type Card, Rating } from '@/schema';
import {
  UiCard,
  UiCardContent,
  UiCardDescription,
  UiCardFooter,
  UiCardHeader,
  UiCardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ratings } from '@/schema';
import { useEffect } from 'react';
import useKeypressRating from '@/hooks/use-keypress-rating';

type Props = {
  card: Card;
  cardContent: CardContent;
  onRating: (rating: Rating) => void;
};

/**
 * Flashcard is the component that displays a {@link Card}
 */
const Flashcard = ({ card, cardContent, onRating }: Props) => {
  useKeypressRating(onRating);

  return (
    <UiCard className='max-w-xl min-w-xl'>
      <UiCardHeader>
        <UiCardTitle>Question</UiCardTitle>
        <UiCardDescription>{card.state}</UiCardDescription>
        {/* <UiCardDescription>{cardContent.question}</UiCardDescription> */}
      </UiCardHeader>
      <UiCardContent className='flex flex-col gap-y-2'>
        <p>Question: {cardContent.question}</p>
        <p>Answer: {cardContent.answer}</p>
      </UiCardContent>
      <UiCardFooter>
        <div className='grid grid-cols-5 gap-x-2 w-full'>
          {ratings.map((rating) => {
            return (
              <Button
                variant='outline'
                key={rating}
                onClick={() => onRating(rating)}
              >
                {rating}
              </Button>
            );
          })}
        </div>
      </UiCardFooter>
    </UiCard>
  );
};

Flashcard.displayName = 'Flashcard';

export default Flashcard;
