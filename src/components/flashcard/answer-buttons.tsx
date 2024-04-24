import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Rating } from "@/schema";
import { cn } from "@/utils/ui";
import { intlFormatDistance } from "date-fns";

type Props = {
  schemaRatingToReviewDay: Record<string, Date>;
  beforeRating?: Rating;
  onRating: (rating: Rating) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

function AnswerButton({
  rating,
  onRating,
  dateString,
  beforeRating,
}: {
  beforeRating?: Rating;
  rating: Rating;
  onRating: (rating: Rating) => void;
  dateString: string;
}) {
  return (
    <TooltipProvider key={rating}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="flex h-16 flex-col gap-0 transition sm:h-full"
            variant={beforeRating === rating ? "secondary" : "outline"}
            onClick={() => onRating(rating)}
          >
            <div>{rating}</div>
            <div className="sm:hidden">{dateString}</div>
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
  beforeRating,
}: Props) {
  const ratingsToShow: Rating[] = ["Again", "Hard", "Good", "Easy"];

  return (
    <div
      className={cn(
        "grid h-full w-screen grid-cols-2 gap-x-2 gap-y-2 px-2 sm:h-12 sm:w-96 md:grid-cols-4",
      )}
    >
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
              beforeRating={beforeRating}
            />
          );
        })
      ) : (
        <Button
          variant="secondary"
          className="col-span-2 h-32 text-2xl sm:h-full sm:text-lg md:col-span-4"
          onClick={() => setOpen(true)}
        >
          Reveal
        </Button>
      )}
    </div>
  );
}

AnswerButtons.displayName = "AnswerButtons";
