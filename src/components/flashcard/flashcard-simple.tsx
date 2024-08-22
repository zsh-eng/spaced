import FlashcardState from "@/components/flashcard/flashcard-state";
import { TimeIconText } from "@/components/time-icon-text";
import { UiCard, UiCardContent, UiCardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/schema";
import { isCardPermanentlySuspended } from "@/utils/card";
import { PauseCircle } from "lucide-react";

type Props = {
  card: Pick<Card, "state" | "createdAt" | "state" | "suspended">;
  cardContent: Pick<CardContent, "id" | "question" | "answer" | "createdAt">;
};

export function FlashcardSimpleSkeleton() {
  return <Skeleton className="flex h-72 w-full flex-col gap-y-4" />;
}

export default function FlashcardSimple({ card, cardContent }: Props) {
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
      </UiCardFooter>
    </UiCard>
  );
}

FlashcardSimple.displayName = "FlashcardSimple";
