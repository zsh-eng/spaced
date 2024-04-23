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
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CardContentFormValues, cardContentFormSchema } from "@/form";
import { useDeleteCard } from "@/hooks/card/use-delete-card";
import { useEditCard } from "@/hooks/card/use-edit-card";
import { useSuspendCard } from "@/hooks/card/use-suspend.card";
import { useClickOutside } from "@/hooks/use-click-outside";
import useKeydownRating from "@/hooks/use-keydown-rating";
import { useHistory } from "@/providers/history";
import { Rating, type Card } from "@/schema";
import { SessionCard, SessionStats } from "@/utils/session";
import { cn } from "@/utils/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import _ from "lodash";
import {
  Check,
  ChevronsRight,
  CircleAlert,
  FilePenIcon,
  Info,
  Telescope,
  TrashIcon,
  Undo,
} from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSwipeable } from "react-swipeable";
import { toast } from "sonner";

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

  const history = useHistory();

  const editCardMutation = useEditCard();
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

    const id = history.add("edit", sessionCard);
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
  const handleSkip = () => {
    const cardId = sessionCard.cards.id;
    const tenMinutesLater = new Date(Date.now() + 1000 * 60 * 10);
    suspendCardMutation.mutate({
      id: cardId,
      suspendUntil: tenMinutesLater,
    });

    const id = history.add("suspend", sessionCard);
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
  const handleDelete = () => {
    deleteCardMutation.mutate({
      id: sessionCard.cards.id,
    });
    const id = history.add("delete", sessionCard);
    toast.success("Card deleted.", {
      action: {
        label: "Undo",
        onClick: () => {
          console.log(history.entries);
          history.undo(id);
        },
      },
    });
  };

  const [beforeRating, setBeforeRating] = useState<Rating | undefined>(
    undefined,
  );
  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      const target = eventData.event.currentTarget;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const { deltaX: x, deltaY: y } = eventData;
      target.style.transition = "none";
      target.style.transform = `translateX(${Math.floor(x / 4)}px)`;

      if (x > 30) {
        setBeforeRating("Good");
      }

      if (x < -30) {
        setBeforeRating("Hard");
      }
    },
    onTouchEndOrOnMouseUp: (eventData) => {
      const target = eventData.event.currentTarget;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      target.style.transition = "transform 0.3s";
      target.style.transform = "translateX(0)";
      setBeforeRating(undefined);
    },
    onSwipedRight: () => {
      if (!open) {
        handleSkip();
        return;
      }
      onRating("Good");
    },
    onSwipedLeft: () => {
      if (!open) {
        history.undo();
        return;
      }
      onRating("Hard");
    },
    delta: 120,
    swipeDuration: 800,
    preventScrollOnSwipe: true,
  });

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
      className="relative col-span-12 flex flex-col gap-x-4 gap-y-4"
      ref={cardRef}
    >
      <div className="absolute -left-12 bottom-1/2 -z-30 -rotate-90 text-2xl font-bold">
        <div
          className={cn(
            "rounded-md bg-background px-8 py-4 text-muted transition duration-300",
            beforeRating && "text-primary",
          )}
        >
          {open ? (
            <>
              Good
              <Check className="ml-2 inline h-8 w-8" strokeWidth={1.5} />
            </>
          ) : (
            <>
              Skip
              <ChevronsRight className="inline h-8 w-8" strokeWidth={1.5} />
            </>
          )}
        </div>
      </div>
      <div
        className={cn(
          "absolute -right-12 bottom-1/2 -z-30 rotate-90 text-2xl font-bold",
        )}
      >
        <div
          className={cn(
            "rounded-md bg-background px-8 py-4 text-muted transition duration-300",

            beforeRating && "text-primary",
          )}
        >
          {open ? (
            <>
              Hard
              <CircleAlert className="ml-2 inline h-6 w-6" strokeWidth={2} />
            </>
          ) : (
            <>
              Undo
              <Undo className="ml-2 inline h-8 w-8" strokeWidth={1.5} />
            </>
          )}
        </div>
      </div>

      <div className="col-span-8 flex h-24 flex-wrap items-end justify-center gap-x-2">
        {/* Stats and review information */}
        <CardCountBadge stats={stats} />
        <FlashcardState
          state={sessionCard.cards.state}
          className="hidden rounded-sm md:flex"
        />

        {/* Separator */}
        <div className="mr-auto w-screen sm:w-0"></div>

        {/* Icons */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-text" onClick={handleSkip}>
              <Button variant="ghost" size="icon">
                <Undo className="h-6 w-6" strokeWidth={1.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-text" onClick={handleSkip}>
              <Button variant="ghost" size="icon">
                <ChevronsRight className="h-6 w-6" strokeWidth={1.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Skip card and show in 10 minutes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
                onClick={() => handleDelete()}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Form {...form}>
        <div
          className="col-span-8 grid grid-cols-8 place-items-end gap-x-4 gap-y-4 bg-background sm:grid-rows-[2fr_1fr]"
          {...handlers}
        >
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

          <div className="h-40 sm:hidden"></div>

          <div className="fixed bottom-8 z-20 col-span-8 flex justify-center self-start justify-self-center sm:static">
            <AnswerButtons
              schemaRatingToReviewDay={schemaRatingToReviewDay}
              onRating={onRating}
              open={open}
              setOpen={setOpen}
              beforeRating={beforeRating}
            />
          </div>
        </div>
      </Form>
    </div>
  );
}

Flashcard.displayName = "Flashcard";
