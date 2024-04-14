import { Badge } from "@/components/ui/badge";
import { UiCard, UiCardDescription, UiCardTitle } from "@/components/ui/card";
import { RouterOutputs } from "@/utils/trpc";

type Deck = RouterOutputs["deck"]["all"][0];

type Props = {
  deck: Deck;
};

export default function Deck({ deck }: Props) {
  return (
    <UiCard className="flex max-w-xl flex-col gap-y-2 px-6 py-6">
      <UiCardTitle>{deck.name}</UiCardTitle>
      <UiCardDescription>{deck.description}</UiCardDescription>
      <Badge variant="outline" className="ml-auto mt-4 w-max">
        {deck.cardCount} cards
      </Badge>
    </UiCard>
  );
}

Deck.displayName = "Deck";
