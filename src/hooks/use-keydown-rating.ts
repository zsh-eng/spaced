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
      if (!open) {
        onOpen();
        return;
      }

      switch (event.key) {
        case "1":
          onRating(ratings[1]);
          break;
        case "2":
          onRating(ratings[2]);
          break;
        case "3":
        case " ":
          onRating(ratings[3]);
          break;
        case "4":
          onRating(ratings[4]);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onRating, open, onOpen]);
}
