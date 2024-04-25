import { cn } from "@/utils/ui";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  /**
   * The direction the user swiped the flashcard
   */
  direction: "left" | "right";
  /**
   * Whether the action is currently active
   */
  active: boolean;
}>;

/**
 * The action that's shown when a user swipes a flashcard
 */
export function SwipeActionText({ direction, active, children }: Props) {
  // Position of text is opposite of direction
  return (
    <div
      className={cn(
        "absolute bottom-1/2 -z-30 text-2xl font-bold",
        direction === "left" ? "-right-12 rotate-90" : "-left-12 -rotate-90",
      )}
    >
      <div
        className={cn(
          "rounded-md px-8 py-4 text-muted transition duration-300",
          active && "animate-wiggle text-primary",
        )}
      >
        {children}
      </div>
    </div>
  );
}

SwipeActionText.displayName = "SwipeActionText";
