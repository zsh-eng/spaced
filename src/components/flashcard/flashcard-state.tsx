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
      ? "bg-accentblue"
      : state === "Learning"
        ? "bg-destructive"
        : state === "Relearning"
          ? "bg-destructive"
          : state === "Review"
            ? "bg-success"
            : "";

  return (
    <Badge
      variant="outline"
      className={cn("flex w-fit items-center justify-start", className)}
    >
      <div
        className={cn(
          "mb-[1px] mr-1 inline-block h-2 w-2 rounded-full",
          colour,
        )}
      ></div>
      <div className={cn(className)}>{state}</div>
    </Badge>
  );
}
