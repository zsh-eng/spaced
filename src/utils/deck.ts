import { NewDeck } from "@/schema";

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
