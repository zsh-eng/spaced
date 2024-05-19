import { useSubscribeObsidian } from "@/hooks/use-subscribe-obsidian";
import { useFlashcardSession } from "@/providers/flashcard-session";
import { OBSIDIAN_ACTION } from "@/utils/obsidian";
import { createContext, useContext } from "react";

type ObsidianContextValue = {};

// Currently, we don't need any context value for Obsidian, so we just create an empty context.
// Eventually, we might want to expose certain data such as the currently selected file
// in Obsidian, etc. and in that case the context can provide that data.
const ObsidianContext = createContext<ObsidianContextValue | undefined>(
  undefined,
);

export function useObsidianContext() {
  const context = useContext(ObsidianContext);
  if (!context) {
    throw new Error(
      "useObsidianContext must be used within an ObsidianProvider",
    );
  }
  return context;
}

export function ObsidianProvider({ children }: { children: React.ReactNode }) {
  const { onEdit, currentCard } = useFlashcardSession();

  useSubscribeObsidian(OBSIDIAN_ACTION.GET_CURRENT_CARD, () => {
    return {
      success: true,
      data: currentCard,
    };
  });

  useSubscribeObsidian(OBSIDIAN_ACTION.UPDATE_FRONT, async (content) => {
    if (!currentCard) {
      return {
        success: false,
        data: "No card to update",
      };
    }

    onEdit(
      {
        question: content,
        answer: currentCard?.card_contents.answer,
      },
      currentCard,
    );

    return {
      success: true,
    };
  });

  useSubscribeObsidian(OBSIDIAN_ACTION.UPDATE_BACK, async (content) => {
    if (!currentCard) {
      return {
        success: false,
        data: "No card to update",
      };
    }

    onEdit(
      {
        question: currentCard.card_contents.question,
        answer: content,
      },
      currentCard,
    );

    return {
      success: true,
    };
  });

  return (
    <ObsidianContext.Provider value={{}}>{children}</ObsidianContext.Provider>
  );
}
