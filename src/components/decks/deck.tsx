import { TimeIconText } from "@/components/time-icon-text";
import { Badge } from "@/components/ui/badge";
import { UiCard, UiCardDescription, UiCardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RouterOutputs } from "@/utils/trpc";
import Link from "next/link";

type Deck = RouterOutputs["deck"]["all"][0];

type Props = {
  deck: Deck;
};

export function DeckSkeleton() {
  return <Skeleton className="h-48 w-[36rem]" />;
}

export default function Deck({ deck }: Props) {
  return (
    <Link href={`/decks/${deck.id}`}>
      <UiCard className="flex max-w-xl cursor-pointer flex-col gap-y-2 px-6 py-6">
        <UiCardTitle>{deck.name}</UiCardTitle>
        <UiCardDescription>{deck.description}</UiCardDescription>
        <div className="mt-auto flex items-end">
          <TimeIconText date={deck.createdAt} />
          <Badge variant="outline" className="ml-auto mt-4 w-max">
            {deck.cardCount} cards
          </Badge>
        </div>
      </UiCard>
    </Link>
  );
}

Deck.displayName = "Deck";
