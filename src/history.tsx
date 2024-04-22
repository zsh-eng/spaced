import { useDeleteCard } from "@/hooks/card/use-delete-card";
import { useEditCard } from "@/hooks/card/use-edit-card";
import { useManualGradeCard } from "@/hooks/card/use-manual-grade-card";
import { useSuspendCard } from "@/hooks/card/use-suspend.card";
import { SessionCard } from "@/utils/session";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

// HistoryContext
// useHistory hook that throws an error if used outside of a HistoryProvider
// HistoryProvider that provides the history state and implements the undo functionality

// The undo functionality should trigger a promise based toast
// If the promise fails, then the toast will display an error message and
// we won't update the history state
// Else, we'll run setState with the filtered entries

type ChangeType = "grade" | "edit" | "delete" | "create" | "suspend";

type HistoryStateEntry = {
  id: string;
  date: Date;
  type: ChangeType;
  card: SessionCard;
};

type HistoryState = {
  readonly entries: ReadonlyArray<HistoryStateEntry>;
  add: (type: ChangeType, previousCard: SessionCard) => string;
  undo: (id?: string) => void;
};

const HistoryContext = createContext<HistoryState | undefined>(undefined);

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}

export function HistoryProvider({ children }: PropsWithChildren<{}>) {
  const entriesRef = useRef<HistoryStateEntry[]>([]);
  const [isUndoing, setIsUndoing] = useState(false);

  const editCardMutation = useEditCard();
  const deleteCardMutation = useDeleteCard();
  const manualGradeCardMutation = useManualGradeCard();
  const suspendCardMutation = useSuspendCard();

  const add = (type: ChangeType, card: SessionCard): string => {
    const id = crypto.randomUUID();
    console.log(
      "Adding entry",
      id,
      type,
      card.cards.id,
      entriesRef.current.length,
    );
    entriesRef.current.push({
      id,
      date: new Date(),
      type,
      card,
    });
    console.log(entriesRef.current);
    return id;
  };

  const getEntry = (id?: string): HistoryStateEntry | undefined => {
    if (!id) {
      return entriesRef.current[entriesRef.current.length - 1];
    }

    const index = entriesRef.current.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return;
    }

    return entriesRef.current[index];
  };

  // We only implement the undo operations here
  // Optimistic updates and managing of session data is handled
  // by the individual hooks
  // TODO check if mutate will throw an error on Error
  const undoCreate = async (entry: HistoryStateEntry) => {
    await deleteCardMutation.mutateAsync({
      id: entry.card.cards.id,
      deleted: true,
    });
  };
  const undoGrade = async (entry: HistoryStateEntry) => {
    await manualGradeCardMutation.mutateAsync({
      card: entry.card.cards,
    });
  };
  const undoDelete = async (entry: HistoryStateEntry) => {
    await deleteCardMutation.mutateAsync({
      id: entry.card.cards.id,
      deleted: false,
    });
  };
  const undoEdit = async (entry: HistoryStateEntry) => {
    await editCardMutation.mutateAsync({
      cardContentId: entry.card.card_contents.id,
      question: entry.card.card_contents.question,
      answer: entry.card.card_contents.answer,
    });
  };
  const undoSuspend = async (entry: HistoryStateEntry) => {
    await suspendCardMutation.mutateAsync({
      id: entry.card.cards.id,
      suspendUntil: new Date(entry.card.cards.suspended),
    });
  };

  const undo = (id?: string) => {
    console.log("Undoing", entriesRef.current);
    if (entriesRef.current.length === 0) {
      toast.info("Nothing left to undo.");
      return;
    }

    if (isUndoing) {
      return;
    }

    const entry = getEntry(id);
    if (!entry) {
      console.log("Entry not found", entriesRef.current);
      return;
    }

    setIsUndoing(true);
    switch (entry.type) {
      case "create":
        toast.promise(undoCreate(entry), {
          loading: "Undoing...",
          success: "Card deleted.",
          error: "Failed to undo card creation. Please try again.",
        });
        break;
      case "grade":
        toast.promise(undoGrade(entry), {
          loading: "Undoing...",
          success: "Rating undone successfully.",
          error: "Failed to undo card rating. Please try again.",
        });
        break;
      case "edit":
        toast.promise(undoEdit(entry), {
          loading: "Undoing...",
          success: "Card contents reverted to previous state.",
          error: "Failed to undo card edit. Please try again.",
        });
        break;
      case "delete":
        toast.promise(undoDelete(entry), {
          loading: "Undoing...",
          success: "Card restored.",
          error: "Failed to undo card deletion. Please try again.",
        });
        break;
      case "suspend":
        toast.promise(undoSuspend(entry), {
          loading: "Undoing...",
          success: "Card unsuspended.",
          error: "Failed to undo card suspension. Please try again.",
        });
        break;
      default:
        const _: never = entry.type;
    }

    entriesRef.current = entriesRef.current.filter((e) => e.id !== entry.id);
    setIsUndoing(false);
  };

  const state = {
    entries: entriesRef.current,
    add,
    undo,
    isUndoing,
  };

  return (
    <HistoryContext.Provider value={state}>{children}</HistoryContext.Provider>
  );
}
