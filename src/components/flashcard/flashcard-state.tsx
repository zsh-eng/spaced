import { State } from "@/schema";
import { cn } from "@/utils/ui";

export default function FlashcardState({
  state,
  className,
}: {
  state: State;
  className?: string;
}) {
  switch (state) {
    case "New":
      return <span className={cn("text-accentblue", className)}>{state}</span>;
    case "Learning":
      return <span className={cn("text-destructive", className)}>{state}</span>;
    case "Relearning":
      return <span className={cn("text-destructive", className)}>{state}</span>;
    case "Review":
      return <span className={cn("text-success", className)}>{state}</span>;
    default:
      return <span>{state}</span>;
  }
}
