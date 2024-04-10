import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Rating, ratings } from '@/schema';
import { intlFormatDistance } from 'date-fns';

type Props = {
  schemaRatingToReviewDay: Record<string, Date>;
  onRating: (rating: Rating) => void;
};

/**
 * The buttons to answer a flashcard.
 */
export default function AnswerButtons({
  schemaRatingToReviewDay,
  onRating,
}: Props) {
  return (
    <div className='grid grid-cols-3 gap-x-2 gap-y-2 w-full'>
      {ratings.map((rating) => {
        return (
          <TooltipProvider key={rating}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='outline' onClick={() => onRating(rating)}>
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
  );
}

AnswerButtons.displayName = 'AnswerButtons';
