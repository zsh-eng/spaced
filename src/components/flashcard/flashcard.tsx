"use client";

import AnswerButtons from "@/components/flashcard/answer-buttons";
import CardCountBadge from "@/components/flashcard/card-count-badge";
import FlashcardState from "@/components/flashcard/flashcard-state";
import { SwipeAction } from "@/components/flashcard/swipe-action";
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

type Props = {
  card: SessionCard;
  schemaRatingToReviewDay: Record<Rating, Date>;
  stats: SessionStats;

  onRating: (rating: Rating) => void;
  onEdit: (content: CardContentFormValues) => void;
  onSkip: () => void;
  onDelete: () => void;
};

const SWIPE_THRESHOLD = 120;
const SWIPE_DURATION = 500;
const SWIPE_PADDING = 60;
const targetIsHTMLElement = (
  target: EventTarget | null,
): target is HTMLElement => {
  return target instanceof HTMLElement;
};

/**
 * Flashcard is the component that displays a {@link Card}
 */
export default function Flashcard({
  card: sessionCard,
  stats,
  schemaRatingToReviewDay,
  onRating,
  onEdit,
  onDelete,
  onSkip,
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

  const handleEdit = () => {
    // `getValues()` will be undefined if the form is disabled
    // TODO use readonly field instead
    // See https://www.react-hook-form.com/api/useform/getvalues/#:~:text=%5B%27%27%5D-,Rules,-Disabled%20inputs%20will
    const content = form.getValues();
    onEdit(content);
  };

  const [beforeRating, setBeforeRating] = useState<Rating | undefined>(
    undefined,
  );
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(
    undefined,
  );
  const handlers = useSwipeable({
    onSwipeStart: (eventData) => {
      const target = eventData.event.currentTarget;
      if (!targetIsHTMLElement(target)) return;
      target.style.transition = "transform 0.05s";

      const id = setTimeout(() => {
        setBeforeRating(undefined);
      }, SWIPE_DURATION);
      setTimeoutId(id);
    },
    onSwiping: (eventData) => {
      const target = eventData.event.currentTarget;
      if (!targetIsHTMLElement(target)) return;

      const { deltaX: x, deltaY: y } = eventData;
      const absX = Math.abs(x);
      const transformAbsDistance =
        Math.floor(absX / 4) + absX > SWIPE_THRESHOLD ? SWIPE_PADDING : 0;
      const transformDistance =
        x > 0 ? transformAbsDistance : -transformAbsDistance;
      target.style.transform = `translateX(${transformDistance}px)`;

      if (x > SWIPE_THRESHOLD) {
        setBeforeRating("Good");
      }

      if (x < -SWIPE_THRESHOLD) {
        setBeforeRating("Hard");
      }
    },
    onTouchEndOrOnMouseUp: (eventData) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(undefined);
      }

      const target = eventData.event.currentTarget;
      if (!targetIsHTMLElement(target)) return;

      target.style.transition = "transform 0.3s";
      target.style.transform = "translateX(0)";
      setBeforeRating(undefined);
    },
    onSwipedRight: () => {
      if (!open) {
        onSkip();
        return;
      }
      beforeRating && onRating(beforeRating);
    },
    onSwipedLeft: () => {
      if (!open) {
        history.undo();
        return;
      }
      beforeRating && onRating(beforeRating);
    },
    delta: SWIPE_THRESHOLD,
    swipeDuration: SWIPE_DURATION + 100,
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
      <SwipeAction direction="right" active={!!beforeRating}>
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
      </SwipeAction>
      <SwipeAction direction="left" active={!!beforeRating}>
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
      </SwipeAction>

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
            <TooltipTrigger
              className="cursor-text"
              onClick={() => history.undo()}
            >
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
            <TooltipTrigger className="cursor-text" onClick={onSkip}>
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
              <AlertDialogAction variant="destructive" onClick={onDelete}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Form {...form}>
        <div
          className="col-span-8 grid grid-cols-8 place-items-end gap-x-4 gap-y-4 bg-background"
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
        </div>
      </Form>

      <div className="fixed bottom-8 z-20 mx-auto sm:static">
        <AnswerButtons
          schemaRatingToReviewDay={schemaRatingToReviewDay}
          onRating={onRating}
          open={open}
          setOpen={setOpen}
          beforeRating={beforeRating}
        />
      </div>
    </div>
  );
}

Flashcard.displayName = "Flashcard";
