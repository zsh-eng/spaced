import { SelectData } from "@/components/form/form-select";
import { NewDeck } from "@/schema";
import { RouterOutputs } from "@/utils/trpc";

export function newDeck({
  name,
  description,
}: {
  name: string;
  description?: string;
}): NewDeck {
  return {
    id: crypto.randomUUID(),
    name,
    description: description ?? "",
  };
}

type AllDeckData = RouterOutputs["deck"]["all"];

export function allDeckDataToSelectData(data: AllDeckData): SelectData {
  return data.map((deck) => ({
    value: deck.id,
    label: deck.name,
  }));
}
