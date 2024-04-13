import { State } from "@/schema";

export default function FlashcardState({ state }: { state: State }) {
  switch (state) {
    case "New":
      return <span className="text-accentblue">{state}</span>;
    case "Learning":
      return <span className="text-destructive">{state}</span>;
    case "Relearning":
      return <span className="text-destructive">{state}</span>;
    case "Review":
      return <span className="text-success">{state}</span>;
    default:
      return <span>{state}</span>;
  }
}
