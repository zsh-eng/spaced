"use client";

import AnswerButtons from "@/components/flashcard/answer-buttons";
import FlashcardState from "@/components/flashcard/flashcard-state";
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
import { Button } from "@/components/ui/button";
import {
  UiCard,
  UiCardContent,
  UiCardDescription,
  UiCardFooter,
  UiCardHeader,
  UiCardTitle,
} from "@/components/ui/card";
import EditableTextarea from "@/components/ui/editable-textarea";
import { Toggle } from "@/components/ui/toggle";
import { useDeleteCard } from "@/hooks/card/use-delete-card";
import { useEditCard } from "@/hooks/card/use-edit-card";
import { useClickOutside } from "@/hooks/use-click-outside";
import useKeydownRating from "@/hooks/use-keydown-rating";
import { CardContent, Rating, type Card } from "@/schema";
import { AllowDateString } from "@/utils/fsrs";
import { cn } from "@/utils/ui";
import { EyeIcon, FilePenIcon, TrashIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  card: AllowDateString<Card>;
  cardContent: CardContent;
  onRating: (rating: Rating) => void;
  schemaRatingToReviewDay: Record<Rating, Date>;
};

/**
 * Flashcard is the component that displays a {@link Card}
 */
export default function Flashcard({
  card,
  cardContent: initialCardContent,
  onRating,
  schemaRatingToReviewDay,
}: Props) {
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

    setEditing(false);
    editCardMutation.mutate({
      cardContentId: id,
      question,
      answer,
    });
  };

  useKeydownRating(onRating, open, () => setOpen(!open));
  useClickOutside({
    ref: cardRef,
    enabled: editing,
    callback: () => {
      setEditing(false);
      handleEdit();
    },
  });

  useEffect(() => {
    setContent(initialCardContent);
  }, [initialCardContent]);

  useEffect(() => {
    setOpen(false);
  }, [card.id]);

  return (
    <UiCard className="w-full md:w-[36rem]" ref={cardRef}>
      <UiCardHeader>
        <UiCardTitle>
          <div className="flex justify-between">
            <p className="">Flashcard</p>
            <div className="flex justify-end gap-x-2">
              <Toggle
                aria-label="toggle edit"
                pressed={editing}
                onPressedChange={(isEditing) => {
                  setEditing(isEditing);
                  if (!isEditing) handleEdit();
                }}
              >
                <FilePenIcon className="h-4 w-4" strokeWidth={1.5} />
              </Toggle>
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button variant="outline" size="icon">
                    <TrashIcon className="h-4 w-4" strokeWidth={1.5} />
                  </Button>
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
                      onClick={() => deleteCard.mutate(card.id)}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </UiCardTitle>
        <UiCardDescription>
          <FlashcardState state={card.state} />
        </UiCardDescription>
        {/* <UiCardDescription>{cardContent.question}</UiCardDescription> */}
      </UiCardHeader>

      <UiCardContent className="flex min-h-96 flex-col gap-y-4">
        <EditableTextarea
          className="h-40 resize-none"
          spellCheck="false"
          editing={editing}
          setEditing={setEditing}
          placeholder="Question"
          value={question}
          onChange={(e) => {
            setContent((prev) => ({ ...prev, question: e.target.value }));
          }}
          onKeyDown={(e) => e.stopPropagation()}
        />

        <hr className="mx-auto w-8" />

        <div className="relative w-full">
          <div
            className={cn(
              "group absolute -bottom-8 h-48 w-full cursor-pointer rounded-lg bg-background shadow-sm ring-1 ring-primary/10 transition duration-150 slide-in-from-top-20 hover:bg-background/30 hover:backdrop-blur-sm",
              open ? "hidden" : "",
            )}
            onClick={() => setOpen(true)}
          >
            <div className="flex h-full w-full items-center justify-center">
              <EyeIcon className="h-8 w-8 text-muted-foreground/20 transition-all duration-300 group-hover:opacity-0" />
            </div>
          </div>

          {
            <EditableTextarea
              className="h-40 resize-none"
              spellCheck="false"
              editing={editing}
              setEditing={setEditing}
              placeholder="Answer"
              value={answer}
              onChange={(e) => {
                setContent((prev) => ({ ...prev, answer: e.target.value }));
              }}
              onKeyDown={(e) => e.stopPropagation()}
            />
          }
        </div>
      </UiCardContent>

      <UiCardFooter className="h-24">
        {open && (
          <AnswerButtons
            schemaRatingToReviewDay={schemaRatingToReviewDay}
            onRating={onRating}
          />
        )}
      </UiCardFooter>
    </UiCard>
  );
}

Flashcard.displayName = "Flashcard";
