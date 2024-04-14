import { NewDeck } from "@/schema";

export function newDeck({ name }: { name: string }): NewDeck {
  return {
    id: crypto.randomUUID(),
    name,
  };
}
