import { Badge } from "@/components/ui/badge";
import { State } from "@/schema";
import { cn } from "@/utils/ui";

export default function FlashcardState({
  state,
  className,
}: {
  state: State;
  className?: string;
}) {
  const colour =
    state === "New"
      ? "before:bg-accentblue"
      : state === "Learning"
        ? "before:bg-destructive"
        : state === "Relearning"
          ? "before:bg-destructive"
          : state === "Review"
            ? "before:bg-success"
            : "";

  return (
    <Badge variant="dot" className={cn("h-8", colour, className)}>
      {state}
    </Badge>
  );
}
