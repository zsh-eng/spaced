import { UiCard, UiCardDescription, UiCardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RouterOutputs } from "@/utils/trpc";
import { format } from "date-fns";
import { BookIcon, Clock } from "lucide-react";
import Link from "next/link";

type Deck = RouterOutputs["deck"]["all"][0];

type Props = {
  deck: Deck;
};

export function DeckSkeleton() {
  return <Skeleton className="h-24 w-full sm:h-36 sm:w-72" />;
}

export default function Deck({ deck }: Props) {
  return (
    <Link href={`/decks/${deck.id}`} legacyBehavior passHref className="">
      <UiCard className="group relative flex h-full w-full cursor-pointer flex-col items-start justify-start gap-y-1 border-background bg-muted px-4 py-3 pb-10 text-background shadow-lg transition duration-300 hover:shadow-md sm:h-36 sm:w-72 sm:gap-y-2 sm:py-6 sm:pb-6">
        <div className="absolute inset-0 -right-[0.65rem] -top-2 -z-10 h-[103%] scale-[98%] rounded-xl border border-background bg-muted/70 transition duration-200 ease-in group-hover:border group-hover:border-primary"></div>
        <UiCardTitle className="text-lg text-primary sm:text-xl">
          {deck.name}
        </UiCardTitle>
        <UiCardDescription className="line-clamp-1">
          {deck.description}
        </UiCardDescription>
        <div className="absolute bottom-3 left-4 flex items-center text-muted-foreground">
          <Clock className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">
            {format(deck.createdAt, "MMM d")}
          </span>
        </div>
        <span className="absolute bottom-3 right-4 ml-auto mt-4 flex w-max items-center justify-center rounded-md text-xs text-muted-foreground sm:text-sm">
          <BookIcon className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
          {deck.cardCount}
        </span>
      </UiCard>
    </Link>
  );
}

Deck.displayName = "Deck";
