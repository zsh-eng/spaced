import FlashcardState from "@/components/flashcard/flashcard-state";
import { TimeIconText } from "@/components/time-icon-text";
import { UiCard, UiCardContent, UiCardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipIconButton } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/schema";
import { isCardPermanentlySuspended } from "@/utils/card";
import { Edit, PauseCircle, Trash } from "lucide-react";

type Props = {
  card: Pick<Card, "state" | "createdAt" | "state" | "suspended">;
  cardContent: Pick<CardContent, "id" | "question" | "answer" | "createdAt">;
  onEdit: () => void;
};

export function FlashcardSimpleSkeleton() {
  return <Skeleton className="flex h-72 w-full flex-col gap-y-4" />;
}

export default function FlashcardSimple({ card, cardContent, onEdit }: Props) {
  return (
    <UiCard className="flex w-full flex-col gap-y-4">
      <UiCardContent className="mt-6 h-60 overflow-y-auto py-0">
        <div>
          <p className="text-md">{cardContent.question}</p>
        </div>

        <hr className="mx-auto my-6 w-16" />

        <div>
          <p className="text-md">{cardContent.answer}</p>
        </div>
      </UiCardContent>

      <UiCardFooter className="flex gap-2">
        <FlashcardState className="rounded-sm" state={card.state} />
        <TimeIconText date={card.createdAt} />
        {!isCardPermanentlySuspended(card) &&
          card.suspended.getTime() > Date.now() && (
            <>
              Suspended until
              <TimeIconText date={card.suspended} />
            </>
          )}
        {isCardPermanentlySuspended(card) && (
          <PauseCircle className="h-6 w-6 text-muted-foreground" />
        )}

        <TooltipIconButton
          tooltipContent="Edit"
          className="ml-auto mr-2"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" />
        </TooltipIconButton>

        <TooltipIconButton tooltipContent="Delete" className="">
          <Trash className="h-4 w-4" />
        </TooltipIconButton>
      </UiCardFooter>
    </UiCard>
  );
}

FlashcardSimple.displayName = "FlashcardSimple";
