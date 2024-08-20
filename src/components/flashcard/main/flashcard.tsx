"use client";

import { EditableFlashcard } from "@/components/flashcard/main/editable-flashcard";
import { FlashcardMenuBar } from "@/components/flashcard/main/flashcard-menu-bar";
import RatingButtons from "@/components/flashcard/main/rating-buttons";
import { SwipeActionText } from "@/components/flashcard/main/swipe-action";
import { CardContentFormValues, cardContentFormSchema } from "@/form";
import { useClickOutside } from "@/hooks/use-click-outside";
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

  open: boolean;
  setOpen: (open: boolean) => void;
};

const SWIPE_THRESHOLD = 60;
const SWIPE_PADDING = 60;
const ANIMATION_DURATION = 200;
const SWIPE_DURATION = ANIMATION_DURATION + 500;

const targetIsHTMLElement = (
  target: EventTarget | null,
): target is HTMLElement => {
  return target instanceof HTMLElement;
};

function replaceCardWithPlaceholder(
  card: HTMLElement,
  placeholder: HTMLElement,
) {
  const rect = card.getBoundingClientRect();
  const parentNode = card.parentNode as HTMLElement;
  const parentRect = parentNode.getBoundingClientRect();

  // Position the target element correctly
  card.style.left = `${rect.left - parentRect.left}px`;
  card.style.top = `${rect.top - parentRect.top}px`;
  // Set up the placeholder element to be same size as the target element
  placeholder.style.height = `${rect.height}px`;
  placeholder.style.display = "block";
  card.parentNode?.insertBefore(placeholder, card);
  // Set up the target element
  card.style.transition = "transform 0.05s";
  card.style.position = "absolute";
  // Ensure that the target element has the same size
  card.style.width = `${rect.width}px`;
  card.style.height = `${rect.height}px`;
}

function revertCardFromPlaceholder(
  card: HTMLElement,
  placeholder: HTMLElement,
) {
  placeholder.style.height = "0px";
  placeholder.style.display = "none";
  card.style.position = "static";
}

function translateCardToThreshold(card: HTMLElement, x: number, y: number) {
  const absX = Math.abs(x);
  const transformAbsDistance =
    Math.floor(absX) + absX > SWIPE_THRESHOLD ? SWIPE_PADDING : 0;
  const transformDistance =
    x > 0 ? transformAbsDistance : -transformAbsDistance;
  card.style.transform = `translateX(${transformDistance}px)`;
}

function revertCardFromTranslation(card: HTMLElement) {
  card.style.transition = `transform ${ANIMATION_DURATION}ms ease-out`;
  card.style.transform = "translateX(0)";
}

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
  open,
  setOpen,
}: Props) {
  const { card_contents: initialCardContent } = sessionCard;
  const [editing, setEditing] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement | null>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

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
      const placeholderElement = placeholderRef.current;
      if (!targetIsHTMLElement(target) || !placeholderElement) return;

      replaceCardWithPlaceholder(target, placeholderElement);

      const id = setTimeout(
        () => setCurrentlyFocusedRating(undefined),
        SWIPE_DURATION - 100,
      );
      setTimeoutId(id);
    },
    onSwiping: (eventData) => {
      const target = eventData.event.currentTarget;
      if (!targetIsHTMLElement(target)) return;

      const { deltaX: x, deltaY: y } = eventData;
      translateCardToThreshold(target, x, y);

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
      const placeholderElement = placeholderRef.current;
      if (!targetIsHTMLElement(target) || !placeholderElement) return;
      revertCardFromTranslation(target);

      setTimeout(
        () => revertCardFromPlaceholder(target, placeholderElement),
        ANIMATION_DURATION,
      );
      currentlyFocusedRating !== "Good" && setCurrentlyFocusedRating(undefined);
    },
    onSwipedRight: () => {
      if (!open) {
        onSkip();
        return;
      }
      navigator.vibrate(50);
      currentlyFocusedRating && onRating(currentlyFocusedRating);
    },
    onSwipedLeft: () => {
      if (!open) {
        history.undo();
        return;
      }
      navigator.vibrate(50);
      currentlyFocusedRating && onRating(currentlyFocusedRating);
    },
    delta: SWIPE_THRESHOLD,
    swipeDuration: SWIPE_DURATION,
    preventScrollOnSwipe: true,
  });

  // https://www.npmjs.com/package/react-swipeable#how-to-share-ref-from-useswipeable
  const cardContainerRefPassthrough = (el: HTMLDivElement | null) => {
    handlers.ref(el);
    if (!el) {
      return;
    }
    cardContainerRef.current = el;
  };

  useClickOutside({
    ref: cardContainerRef,
    enabled: editing,
    callback: () => {
      handleEdit();
      setEditing(false);
    },
  });

  return (
    <div className="relative col-span-12 flex flex-col gap-x-4 gap-y-2 overflow-hidden">
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
        className="col-span-8 grid grid-cols-8 place-items-end gap-x-4 gap-y-2 bg-background"
        {...handlers}
        onDoubleClick={() => {
          if (!open || editing || currentlyFocusedRating || !isMobile) return;
          setCurrentlyFocusedRating("Good");
          setTimeout(() => {
            setCurrentlyFocusedRating(undefined);
            onRating("Good");
          }, 600);
        }}
        ref={cardContainerRefPassthrough}
      >
        <EditableFlashcard
          form={form}
          setOpen={setOpen}
          open={open}
          editing={editing}
        />
      </div>
      <div
        className="-z-40 col-span-12 hidden bg-muted opacity-60 shadow-inner"
        ref={placeholderRef}
      ></div>

      <div
        className="z-20 mb-6 w-full sm:static sm:mx-auto sm:mt-2 sm:w-max"
        ref={answerButtonsContainerRef}
      >
        <RatingButtons
          schemaRatingToReviewDay={schemaRatingToReviewDay}
          onRating={onRating}
          open={open}
          setOpen={setOpen}
          focusedRating={currentlyFocusedRating}
          disabled={editing || !open}
        />
      </div>
    </div>
  );
}

Flashcard.displayName = "Flashcard";
