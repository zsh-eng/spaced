import { KEY_TO_RATING } from "@/common";
import { Rating, ratings } from "@/schema";
import { useEffect } from "react";

/**
 * useKeydown is a hook that listens for keystrokes and calls the `onRating`.
 */
export default function useKeydownRating(
  onRating: (rating: Rating) => void,
  open: boolean,
  onOpen: () => void,
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open && event.key === " ") {
        onOpen();
        return;
      }
      const rating = KEY_TO_RATING[event.key];
      if (!rating) {
        return;
      }
      onRating(rating);
    };

    window.addEventListener("keyup", handleKeyDown);
    return () => {
      window.removeEventListener("keyup", handleKeyDown);
    };
  }, [onRating, open, onOpen]);
}
