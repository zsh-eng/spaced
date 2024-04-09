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
import { getReviewDayForEachRating } from '@/lib/fsrs';
import { CardContent, Rating, ratings, type Card } from '@/schema';
import { intlFormatDistance } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = {
  card: Card;
  cardContent: CardContent;
  onRating: (rating: Rating) => void;
  open: boolean;
  onOpen: () => void;
  schemaRatingToReviewDay: Record<Rating, Date>;
};

/**
 * Flashcard is the component that displays a {@link Card}
 */
const Flashcard = ({
  card,
  cardContent,
  onRating,
  open,
  onOpen,
  schemaRatingToReviewDay,
}: Props) => {
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
          <div className='grid grid-cols-3 gap-x-2 gap-y-2 w-full'>
            {ratings.map((rating) => {
              return (
                <TooltipProvider key={rating}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='outline'
                        onClick={() => onRating(rating)}
                      >
                        <p>{rating}</p>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {intlFormatDistance(
                          schemaRatingToReviewDay[rating],
                          new Date()
                        )}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ) : (
          <Button variant='outline' className='w-full' onClick={() => onOpen()}>
            Press space to open
          </Button>
        )}
      </UiCardFooter>
    </UiCard>
  );
};

Flashcard.displayName = 'Flashcard';

export default Flashcard;
