'use client';

import AnswerButtons from '@/components/flashcard/answer-buttons';
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
import { CardContent, Rating, type Card } from '@/schema';
import { AllowDateString } from '@/utils/fsrs';

type Props = {
  card: AllowDateString<Card>;
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
          <AnswerButtons
            schemaRatingToReviewDay={schemaRatingToReviewDay}
            onRating={onRating}
          />
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
