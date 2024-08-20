import { TimeIconText } from "@/components/time-icon-text";
import { Badge } from "@/components/ui/badge";
import { UiCard, UiCardDescription, UiCardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RouterOutputs } from "@/utils/trpc";
import { format } from "date-fns";
import { BookIcon, Clock, Trash } from "lucide-react";
import Link from "next/link";

type Deck = RouterOutputs["deck"]["all"][0];

type Props = {
  deck: Deck;
};

export function DeckSkeleton() {
  return <Skeleton className="h-80 w-60" />;
}

export default function Deck({ deck }: Props) {
  return (
    <Link href={`/decks/${deck.id}`} legacyBehavior passHref>
      <UiCard className="relative flex h-80 w-60 cursor-pointer flex-col items-center justify-center gap-y-2 bg-accentblue px-6 py-6 text-background shadow-lg transition duration-300 hover:scale-105 hover:shadow-md">
        <UiCardTitle>{deck.name}</UiCardTitle>
        <UiCardDescription>{deck.description}</UiCardDescription>
        <div className="absolute left-2 top-2 flex items-center text-muted">
          <Clock className="mr-1 h-4 w-4" />
          <span className="text-sm">{format(deck.createdAt, "MMM d")}</span>
        </div>
        <span className="absolute bottom-2 right-2 ml-auto mt-4 flex w-max items-center justify-center rounded-md text-sm text-muted">
          <BookIcon className="mr-1 h-4 w-4" />
          {deck.cardCount}
        </span>
      </UiCard>
    </Link>
  );
}

Deck.displayName = "Deck";
