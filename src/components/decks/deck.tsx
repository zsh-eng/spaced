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
  return <Skeleton className="h-40 w-72" />;
}

export default function Deck({ deck }: Props) {
  return (
    <Link href={`/decks/${deck.id}`} legacyBehavior passHref>
      <UiCard className="relative flex h-max w-72 cursor-pointer flex-col items-start justify-start gap-y-2 bg-muted px-4 py-6 pb-14 text-background shadow-lg transition duration-300 hover:shadow-md border-background group">
        <div className="absolute inset-0 -top-2 -right-[0.65rem] scale-[98%] h-[103%] bg-muted/70 -z-10 rounded-xl border border-background group-hover:border group-hover:border-primary transition ease-in duration-200"></div>
        <UiCardTitle className="text-primary">{deck.name}</UiCardTitle>
        <UiCardDescription className="line-clamp-1">
          {deck.description}
        </UiCardDescription>
        <div className="absolute bottom-3 left-4 flex items-center text-muted-foreground">
          <Clock className="mr-1 h-4 w-4" />
          <span className="text-sm">{format(deck.createdAt, "MMM d")}</span>
        </div>
        <span className="absolute bottom-3 right-4 ml-auto mt-4 flex w-max items-center justify-center rounded-md text-sm text-muted-foreground">
          <BookIcon className="mr-1 h-4 w-4" />
          {deck.cardCount}
        </span>
      </UiCard>
    </Link>
  );
}

Deck.displayName = "Deck";
