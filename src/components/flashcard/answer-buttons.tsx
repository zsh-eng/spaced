import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Rating } from "@/schema";
import { intlFormatDistance } from "date-fns";

type Props = {
  schemaRatingToReviewDay: Record<string, Date>;
  onRating: (rating: Rating) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
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
          <Button variant="outline" onClick={() => onRating(rating)}>
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
  open,
  setOpen,
}: Props) {
  const ratingsToShow: Rating[] = ["Again", "Hard", "Good", "Easy"];

  return (
    <div className="grid w-80 grid-cols-2 gap-x-2 gap-y-2 sm:w-96 md:grid-cols-4">
      {open ? (
        ratingsToShow.map((rating) => {
          return (
            <AnswerButton
              key={rating}
              rating={rating}
              onRating={onRating}
              dateString={intlFormatDistance(
                schemaRatingToReviewDay[rating],
                new Date(),
              )}
            />
          );
        })
      ) : (
        <Button
          variant="secondary"
          className="col-span-2 font-mono hover:animate-pulse md:col-span-4"
          onClick={() => setOpen(true)}
        >
          space to reveal
        </Button>
      )}
    </div>
  );
}

AnswerButtons.displayName = "AnswerButtons";
