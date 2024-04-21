"use client";

import AnswerButtons from "@/components/flashcard/answer-buttons";
import CardCountBadge from "@/components/flashcard/card-count-badge";
import FlashcardState from "@/components/flashcard/flashcard-state";
import { FormMarkdownEditor } from "@/components/form/form-markdown-editor";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Toggle } from "@/components/ui/toggle";
import { CardContentFormValues, cardContentFormSchema } from "@/form";
import { useDeleteCard } from "@/hooks/card/use-delete-card";
import { useEditCard } from "@/hooks/card/use-edit-card";
import { useClickOutside } from "@/hooks/use-click-outside";
import useKeydownRating from "@/hooks/use-keydown-rating";
import { Rating, type Card } from "@/schema";
import { SessionCard, SessionStats } from "@/utils/session";
import { cn } from "@/utils/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import _ from "lodash";
import { FilePenIcon, Info, Telescope, TrashIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

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

  const form = useForm<CardContentFormValues>({
    resolver: zodResolver(cardContentFormSchema),
    defaultValues: {
      question: initialCardContent.question,
      answer: initialCardContent.answer,
    },
  });

  const editCardMutation = useEditCard();
  const deleteCard = useDeleteCard();

  const handleEdit = () => {
    // `getValues()` will be undefined if the form is disabled
    // TODO use readonly field instead
    // See https://www.react-hook-form.com/api/useform/getvalues/#:~:text=%5B%27%27%5D-,Rules,-Disabled%20inputs%20will
    const content = form.getValues();

    const isQuestionAnswerSame =
      content.question === initialCardContent.question &&
      content.answer === initialCardContent.answer;
    if (isQuestionAnswerSame) return;

    editCardMutation.mutate({
      cardContentId: initialCardContent.id,
      question: content.question,
      answer: content.answer,
    });
  };

  useKeydownRating(onRating, open, () => setOpen(true));
  useClickOutside({
    ref: cardRef,
    enabled: editing,
    callback: () => {
      handleEdit();
      setEditing(false);
    },
  });

  return (
    <div
      className="col-start-1 col-end-13 grid grid-cols-8 grid-rows-[auto_1fr] gap-x-4 gap-y-2 xl:col-start-3 xl:col-end-11"
      ref={cardRef}
    >
      <div className="col-start-1 col-end-9 flex h-12 items-end gap-x-2 sm:h-24">
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
              handleEdit();
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

      <Form {...form}>
        <div className="col-span-8 grid grid-cols-8 place-items-end gap-x-4 gap-y-4 sm:grid-rows-[2fr_1fr]">
          <div
            className={cn(
              "col-span-8 flex h-full min-h-80 w-full items-center overflow-y-auto border border-input sm:col-span-4 sm:min-h-96",
              editing ? "bg-muted" : "",
            )}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <FormMarkdownEditor
              name="question"
              form={form}
              disabled={!editing}
            />
          </div>

          <div
            className={cn(
              "relative col-span-8 h-full min-h-80 w-full border border-input sm:col-span-4 sm:min-h-96",
              editing ? "bg-muted" : "",
            )}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                "absolute -bottom-0 z-10 h-full w-full cursor-pointer bg-muted transition hover:bg-muted/80",
                open ? "-z-10 opacity-0" : "",
              )}
              onClick={() => setOpen(true)}
            >
              <div className="flex h-full w-full items-center justify-center text-background">
                <Telescope className="h-16 w-16" strokeWidth={1} />
              </div>
            </div>
            <FormMarkdownEditor
              className={cn(
                "flex h-full items-center",
                !open ? "opacity-0" : "",
              )}
              name="answer"
              form={form}
              disabled={!editing}
            />
          </div>

          <div className="col-span-8 flex justify-center self-start justify-self-center">
            <AnswerButtons
              schemaRatingToReviewDay={schemaRatingToReviewDay}
              onRating={onRating}
              open={open}
              setOpen={setOpen}
            />
          </div>
        </div>
      </Form>
    </div>
  );
}

Flashcard.displayName = "Flashcard";
