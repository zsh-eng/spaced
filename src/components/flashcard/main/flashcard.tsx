"use client";

import AnswerButtons from "@/components/flashcard/main/answer-buttons";
import { EditableFlashcard } from "@/components/flashcard/main/editable-flashcard";
import { FlashcardMenuBar } from "@/components/flashcard/main/flashcard-menu-bar";
import { SwipeActionText } from "@/components/flashcard/main/swipe-action";
import { CardContentFormValues, cardContentFormSchema } from "@/form";
import { useClickOutside } from "@/hooks/use-click-outside";
import useKeydownRating from "@/hooks/use-keydown-rating";
import { useHistory } from "@/providers/history";
import { Rating, type Card } from "@/schema";
import { SessionCard, SessionStats } from "@/utils/session";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMediaQuery } from "@uidotdev/usehooks";
import {
  Check,
  ChevronsRight,
  CircleAlert,
  ThumbsUp,
  Undo,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

const SWIPE_THRESHOLD = 40;
const SWIPE_PADDING = 60;
const ANIMATION_DURATION = 200;
const SWIPE_DURATION = ANIMATION_DURATION + 500;

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
  const answerButtonsContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("only screen and (max-width: 640px)");

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

  const [currentlyFocusedRating, setCurrentlyFocusedRating] = useState<
    Rating | undefined
  >(undefined);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(
    undefined,
  );
  const handlers = useSwipeable({
    onSwipeStart: (eventData) => {
      const target = eventData.event.currentTarget;
      if (!targetIsHTMLElement(target)) return;
      target.style.transition = "transform 0.05s";

      const id = setTimeout(() => {
        setCurrentlyFocusedRating(undefined);
      }, SWIPE_DURATION - 100);
      setTimeoutId(id);
    },
    onSwiping: (eventData) => {
      const target = eventData.event.currentTarget;
      if (!targetIsHTMLElement(target)) return;

      const { deltaX: x, deltaY: y } = eventData;
      const absX = Math.abs(x);
      const transformAbsDistance =
        Math.floor(absX) + absX > SWIPE_THRESHOLD ? SWIPE_PADDING : 0;
      const transformDistance =
        x > 0 ? transformAbsDistance : -transformAbsDistance;
      target.style.transform = `translateX(${transformDistance}px)`;

      if (x > SWIPE_THRESHOLD) {
        setCurrentlyFocusedRating("Easy");
      }

      if (x < -SWIPE_THRESHOLD) {
        setCurrentlyFocusedRating("Hard");
      }
    },
    onTouchEndOrOnMouseUp: (eventData) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(undefined);
      }

      const target = eventData.event.currentTarget;
      if (!targetIsHTMLElement(target)) return;

      target.style.transition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      target.style.transform = "translateX(0)";
      currentlyFocusedRating !== "Good" && setCurrentlyFocusedRating(undefined);
    },
    onSwipedRight: () => {
      if (!open) {
        onSkip();
        return;
      }
      currentlyFocusedRating && onRating(currentlyFocusedRating);
    },
    onSwipedLeft: () => {
      if (!open) {
        history.undo();
        return;
      }
      currentlyFocusedRating && onRating(currentlyFocusedRating);
    },
    delta: SWIPE_THRESHOLD,
    swipeDuration: SWIPE_DURATION,
    preventScrollOnSwipe: true,
  });

  useKeydownRating(onRating, open && !editing, () => setOpen(true));
  useClickOutside({
    ref: cardRef,
    enabled: editing,
    callback: () => {
      handleEdit();
      setEditing(false);
    },
  });

  useEffect(() => {
    if (!open) return;
    answerButtonsContainerRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [open]);

  return (
    <div
      className="relative col-span-12 flex flex-col gap-x-4 gap-y-2"
      ref={cardRef}
    >
      {currentlyFocusedRating === "Good" && (
        <ThumbsUp className="absolute bottom-0 left-0 right-0 top-0 z-20 mx-auto my-auto h-12 w-12 animate-tada text-primary" />
      )}

      <SwipeActionText direction="right" active={!!currentlyFocusedRating}>
        {open ? (
          <>
            Easy
            <Check className="ml-2 inline h-8 w-8" strokeWidth={1.5} />
          </>
        ) : (
          <>
            Skip
            <ChevronsRight className="inline h-8 w-8" strokeWidth={1.5} />
          </>
        )}
      </SwipeActionText>
      <SwipeActionText direction="left" active={!!currentlyFocusedRating}>
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
      </SwipeActionText>

      <FlashcardMenuBar
        card={sessionCard}
        stats={stats}
        handleEdit={handleEdit}
        editing={editing}
        setEditing={setEditing}
        onSkip={onSkip}
        onDelete={onDelete}
        onUndo={() => history.undo()}
      />
      <div
        className="col-span-8 grid grid-cols-8 place-items-end gap-x-4 gap-y-4 bg-background"
        {...handlers}
        onDoubleClick={() => {
          if (!open || editing || currentlyFocusedRating || !isMobile) return;
          setCurrentlyFocusedRating("Good");
          setTimeout(() => {
            setCurrentlyFocusedRating(undefined);
            onRating("Good");
          }, 600);
        }}
      >
        <EditableFlashcard
          form={form}
          setOpen={setOpen}
          open={open}
          editing={editing}
        />
      </div>

      <div
        className="z-20 mb-6 w-full sm:static sm:mx-auto sm:w-max"
        ref={answerButtonsContainerRef}
      >
        <AnswerButtons
          schemaRatingToReviewDay={schemaRatingToReviewDay}
          onRating={onRating}
          open={open}
          setOpen={setOpen}
          focusedRating={currentlyFocusedRating}
        />
      </div>
    </div>
  );
}

Flashcard.displayName = "Flashcard";
