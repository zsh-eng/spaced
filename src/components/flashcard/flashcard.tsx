'use client';

import { Button } from '@/components/ui/button';
import {
  UiCard,
  UiCardContent,
  UiCardDescription,
  UiCardFooter,
  UiCardHeader,
  UiCardTitle,
} from '@/components/ui/card';
import useKeypressRating from '@/hooks/use-keypress-rating';
import { CardContent, Rating, ratings, type Card } from '@/schema';

type Props = {
  card: Card;
  cardContent: CardContent;
  onRating: (rating: Rating) => void;
  open: boolean;
  onOpen: () => void;
};

/**
 * Flashcard is the component that displays a {@link Card}
 */
const Flashcard = ({ card, cardContent, onRating, open, onOpen }: Props) => {
  useKeypressRating(onRating, open, onOpen);

  return (
    <UiCard className='max-w-xl min-w-xl'>
      <UiCardHeader>
        <UiCardTitle>Question</UiCardTitle>
        <UiCardDescription>{card.state}</UiCardDescription>
        {/* <UiCardDescription>{cardContent.question}</UiCardDescription> */}
      </UiCardHeader>
      <UiCardContent className='flex flex-col gap-y-2'>
        <p>Question: {cardContent.question}</p>
        {open && <p>Answer: {cardContent.answer}</p>}
      </UiCardContent>
      <UiCardFooter>
        {open ? (
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
        ) : (
          <Button variant='outline'>Press space to open</Button>
        )}
      </UiCardFooter>
    </UiCard>
  );
};

Flashcard.displayName = 'Flashcard';

export default Flashcard;
