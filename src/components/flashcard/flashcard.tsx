"use client";

import AnswerButtons from "@/components/flashcard/answer-buttons";
import CardCountBadge from "@/components/flashcard/card-count-badge";
import FlashcardState from "@/components/flashcard/flashcard-state";
import { MarkdownEditor } from "@/components/markdown-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { UiCard } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EditableTextarea from "@/components/ui/editable-textarea";
import { Toggle } from "@/components/ui/toggle";
import { useDeleteCard } from "@/hooks/card/use-delete-card";
import { useEditCard } from "@/hooks/card/use-edit-card";
import { useClickOutside } from "@/hooks/use-click-outside";
import useKeydownRating from "@/hooks/use-keydown-rating";
import { Rating, type Card } from "@/schema";
import { SessionCard, SessionStats } from "@/utils/session";
import { cn } from "@/utils/ui";
import _ from "lodash";
import { FilePenIcon, Info, TrashIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  card: SessionCard;
  onRating: (rating: Rating) => void;
  schemaRatingToReviewDay: Record<Rating, Date>;
  stats: SessionStats;
};

/**
 * Flashcard is the component that displays a {@link Card}
 */
export default function Flashcard({
  card: sessionCard,
  stats,
  onRating,
  schemaRatingToReviewDay,
}: Props) {
  const { card_contents: initialCardContent } = sessionCard;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [content, setContent] = useState({
    question: initialCardContent.question,
    answer: initialCardContent.answer,
    id: initialCardContent.id,
  });
  const { id, question, answer } = content;

  const editCardMutation = useEditCard();
  const deleteCard = useDeleteCard();

  const handleEdit = () => {
    const hasCardChanged = content.id !== initialCardContent.id;
    if (hasCardChanged) return;

    const isQuestionAnswerSame =
      content.question === initialCardContent.question &&
      content.answer === initialCardContent.answer;
    if (isQuestionAnswerSame) return;

    editCardMutation.mutate({
      cardContentId: id,
      question,
      answer,
    });
  };

  // useCallback is necessary to prevent infinite loop
  // Infinite loop occurs because onSaveContent is used in a
  // useEffect in MilkdownEditorWrapper
  const onSaveQuestion = useCallback(
    (content: string) => {
      setContent((prev) => ({ ...prev, question: content }));
    },
    [setContent],
  );
  const onSaveAnswer = useCallback(
    (content: string) => {
      setContent((prev) => ({ ...prev, answer: content }));
    },
    [setContent],
  );

  useKeydownRating(onRating, open, () => setOpen(!open));
  useClickOutside({
    ref: cardRef,
    enabled: editing,
    callback: () => {
      setEditing(false);
      setTimeout(handleEdit, 500);
    },
  });

  useEffect(() => {
    setContent(initialCardContent);
  }, [initialCardContent]);

  useEffect(() => {
    setOpen(false);
    setEditing(false);
  }, [sessionCard.cards.id]);

  return (
    <div className="flex w-full flex-col gap-y-2 md:w-[36rem]" ref={cardRef}>
      <div className="flex justify-end gap-x-2">
        <CardCountBadge stats={stats} />
        <FlashcardState
          state={sessionCard.cards.state}
          className="hidden rounded-sm md:flex"
        />
        <div className="mr-auto"></div>
        <Toggle
          aria-label="toggle edit"
          pressed={editing}
          onPressedChange={(isEditing) => {
            if (!isEditing) {
              setTimeout(handleEdit, 500);
            }
            setEditing(isEditing);
          }}
        >
          <FilePenIcon className="h-4 w-4" strokeWidth={1.5} />
        </Toggle>

        <Dialog>
          <DialogTrigger
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <Info className="h-4 w-4" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Stats</DialogTitle>
              {Object.entries(sessionCard.cards).map(([k, v]) => {
                return (
                  <DialogDescription key={k}>
                    {_.upperFirst(k)}: {v?.toString()}
                  </DialogDescription>
                );
              })}
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
          >
            <TrashIcon className="h-4 w-4" strokeWidth={1.5} />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this card?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => deleteCard.mutate(sessionCard.cards.id)}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex flex-col gap-y-2">
        <div
          className={cn("h-60 w-full", editing ? "bg-muted" : "")}
          onKeyDown={(e) => e.stopPropagation()}
          onDoubleClick={() => setEditing(true)}
        >
          <MarkdownEditor
            initialContent={question}
            editing={editing}
            onSaveContent={onSaveQuestion}
          />
        </div>

        <div
          className={cn("h-60 w-full", editing ? "bg-muted" : "")}
          onKeyDown={(e) => e.stopPropagation()}
          onDoubleClick={() => setEditing(true)}
        >
          <MarkdownEditor
            initialContent={answer}
            editing={editing}
            onSaveContent={onSaveAnswer}
          />
        </div>
      </div>
      {open && (
        <UiCard>
          <AnswerButtons
            schemaRatingToReviewDay={schemaRatingToReviewDay}
            onRating={onRating}
          />
        </UiCard>
      )}
    </div>
  );
}

Flashcard.displayName = "Flashcard";
