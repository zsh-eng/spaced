import FlashcardState from "@/components/flashcard/flashcard-state";
import { TimeIconText } from "@/components/time-icon-text";
import { UiCard, UiCardContent, UiCardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/schema";

type Props = {
  card: Pick<Card, "state" | "createdAt" | "state">;
  cardContent: Pick<CardContent, "id" | "question" | "answer" | "createdAt">;
};

export function FlashcardSimpleSkeleton() {
  return <Skeleton className="flex h-72 w-full flex-col gap-y-4" />;
}

export default function FlashcardSimple({ card, cardContent }: Props) {
  return (
    <UiCard className="flex w-full flex-col gap-y-4">
      <UiCardContent className="mt-6">
        <ScrollArea className="h-60">
          <div>
            <h2 className="mb-2 text-xl font-semibold lg:text-2xl">Question</h2>
            <p className="text-md">{cardContent.question}</p>
          </div>

          <hr className="mx-auto my-6 w-16" />

          <div>
            <h2 className="mb-2 text-xl font-semibold lg:text-2xl">Answer</h2>
            <p className="text-md">{cardContent.answer}</p>
          </div>
        </ScrollArea>
      </UiCardContent>
      <UiCardFooter className="flex">
        <TimeIconText date={card.createdAt} />
        <FlashcardState className="ml-auto" state={card.state} />
      </UiCardFooter>
    </UiCard>
  );
}

FlashcardSimple.displayName = "FlashcardSimple";
