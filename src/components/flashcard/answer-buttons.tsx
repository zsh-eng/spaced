import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Rating } from '@/schema';
import { intlFormatDistance } from 'date-fns';

type Props = {
  schemaRatingToReviewDay: Record<string, Date>;
  onRating: (rating: Rating) => void;
};

function AnswerButton({
  rating,
  onRating,
  dateString,
}: {
  rating: Rating;
  onRating: (rating: Rating) => void;
  dateString: string;
}) {
  return (
    <TooltipProvider key={rating}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='outline' onClick={() => onRating(rating)}>
            <p>{rating}</p>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{dateString}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * The buttons to answer a flashcard.
 */
export default function AnswerButtons({
  schemaRatingToReviewDay,
  onRating,
}: Props) {
  const ratingsToShow: Rating[] = ['Again', 'Hard', 'Good', 'Easy'];

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-2 w-full'>
      {ratingsToShow.map((rating) => {
        return (
          <AnswerButton
            key={rating}
            rating={rating}
            onRating={onRating}
            dateString={intlFormatDistance(
              schemaRatingToReviewDay[rating],
              new Date()
            )}
          />
        );
      })}
    </div>
  );
}

AnswerButtons.displayName = 'AnswerButtons';
