import { CardContentFormValues } from "@/form";
import { useDeleteCard } from "@/hooks/card/use-delete-card";
import { useEditCard } from "@/hooks/card/use-edit-card";
import { useGradeCard } from "@/hooks/card/use-grade-card";
import { useSuspendCard } from "@/hooks/card/use-suspend.card";
import { useSubscribeObsidian } from "@/hooks/use-subscribe-obsidian";
import { useHistory } from "@/providers/history";
import { Rating } from "@/schema";
import { getReviewDateForEachRating } from "@/utils/fsrs";
import { OBSIDIAN_ACTION } from "@/utils/obsidian";
import { SessionCard, SessionData } from "@/utils/session";
import { trpc } from "@/utils/trpc";
import { intlFormatDistance } from "date-fns";
import { createContext, useContext } from "react";
import { toast } from "sonner";

type FlashcardSession = {
  data: SessionData;
  currentCard?: SessionCard;
  isLoading: boolean;
  error?: string;

  onRating: (rating: Rating, card: SessionCard) => void;
  onEdit: (content: CardContentFormValues, card: SessionCard) => void;
  onSkip: (card: SessionCard) => void;
  onDelete: (card: SessionCard) => void;
};

const FlashcardSessionContext = createContext<FlashcardSession | undefined>(
  undefined,
);

export function useFlashcardSession() {
  const context = useContext(FlashcardSessionContext);
  if (!context) {
    throw new Error(
      "useFlashcardSession must be used within a FlashcardSessionProvider",
    );
  }
  return context;
}

const defaultSessionData = {
  newCards: [],
  reviewCards: [],
  stats: {
    new: 0,
    learning: 0,
    review: 0,
    total: 0,
  },
} satisfies SessionData;

function hashIds(id1: string, id2: string): number {
  // Combine the IDs and convert to a number
  const combined = id1 + id2;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function getNextCard(data: SessionData): SessionCard | undefined {
  if (data.reviewCards.length === 0 && data.newCards.length === 0) {
    return;
  }

  if (data.reviewCards.length === 0) {
    return data.newCards[0];
  }

  const newCard = data.newCards[0];
  const reviewCard = data.reviewCards[0];

  // Hacky way to ensure that the comparison of new cards and review cards is "random"
  // but deterministic
  if (hashIds(newCard.cards.id, reviewCard.cards.id) % 4 === 0) {
    return newCard;
  }

  return reviewCard;
}

export function FlashcardSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data = defaultSessionData,
    isLoading: isLoading,
    error: error,
  } = trpc.card.sessionData.useQuery();
  const history = useHistory();
  const currentCard = getNextCard(data);

  const gradeCardMutation = useGradeCard();
  const onRating = (rating: Rating, card: SessionCard) => {
    const schemaRatingToReviewDay = getReviewDateForEachRating(card.cards);
    const reviewDay = schemaRatingToReviewDay[rating];

    gradeCardMutation.mutate({
      grade: rating,
      id: card.cards.id,
    });

    const id = history.add("grade", card);

    toast(`Card marked as ${rating}.`, {
      action: {
        label: "Undo",
        onClick: () => {
          history.undo(id);
        },
      },
      description: `You'll see this again ${intlFormatDistance(
        reviewDay,
        new Date(),
      )}`,
    });
  };

  const editCardMutation = useEditCard();
  const onEdit = (content: CardContentFormValues, card: SessionCard) => {
    // `getValues()` will be undefined if the form is disabled
    // TODO use readonly field instead
    // See https://www.react-hook-form.com/api/useform/getvalues/#:~:text=%5B%27%27%5D-,Rules,-Disabled%20inputs%20will
    const initialCardContent = card.card_contents;
    const isQuestionAnswerSame =
      content.question === initialCardContent.question &&
      content.answer === initialCardContent.answer;
    if (isQuestionAnswerSame) return;

    editCardMutation.mutate({
      cardContentId: initialCardContent.id,
      question: content.question,
      answer: content.answer,
    });

    const id = history.add("edit", card);

    toast.success("Card updated.", {
      action: {
        label: "Undo",
        onClick: () => {
          history.undo(id);
        },
      },
    });
  };

  const suspendCardMutation = useSuspendCard();
  const onSkip = (card: SessionCard) => {
    const cardId = card.cards.id;
    const tenMinutesLater = new Date(Date.now() + 1000 * 60 * 10);
    suspendCardMutation.mutate({
      id: cardId,
      suspendUntil: tenMinutesLater,
    });

    const id = history.add("suspend", card);

    toast.success("Card suspended for 10 minutes.", {
      action: {
        label: "Undo",
        onClick: () => {
          history.undo(id);
        },
      },
    });
  };

  const deleteCardMutation = useDeleteCard();
  const onDelete = (card: SessionCard) => {
    deleteCardMutation.mutate({
      id: card.cards.id,
    });
    const id = history.add("delete", card);

    toast.success("Card deleted.", {
      action: {
        label: "Undo",
        onClick: () => {
          history.undo(id);
        },
      },
    });
  };

  useSubscribeObsidian(OBSIDIAN_ACTION.GET_CURRENT_CARD, () => {
    return {
      success: true,
      data: currentCard,
    };
  });

  useSubscribeObsidian(
    OBSIDIAN_ACTION.UPDATE_FRONT,
    async (content: unknown) => {
      if (!currentCard) {
        return {
          success: false,
          data: "No card to update",
        };
      }

      if (!(typeof content === "string")) {
        return {
          success: false,
          data: "Invalid content type",
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
    },
  );

  useSubscribeObsidian(
    OBSIDIAN_ACTION.UPDATE_BACK,
    async (content: unknown) => {
      if (!currentCard) {
        return {
          success: false,
          data: "No card to update",
        };
      }

      if (!(typeof content === "string")) {
        return {
          success: false,
          data: "Invalid content type",
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
    },
  );

  return (
    <FlashcardSessionContext.Provider
      value={{
        //data
        data,
        currentCard,
        isLoading,
        error: error?.message,
        // functions
        onRating,
        onEdit,
        onSkip,
        onDelete,
      }}
    >
      {children}
    </FlashcardSessionContext.Provider>
  );
}
