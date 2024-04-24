"use client";

import AnswerButtons from "@/components/flashcard/answer-buttons";
import { EditableFlashcard } from "@/components/flashcard/editable-flashcard";
import { FlashcardMenuBar } from "@/components/flashcard/flashcard-menu-bar";
import { SwipeAction } from "@/components/flashcard/swipe-action";
import { CardContentFormValues, cardContentFormSchema } from "@/form";
import { useClickOutside } from "@/hooks/use-click-outside";
import useKeydownRating from "@/hooks/use-keydown-rating";
import { useHistory } from "@/providers/history";
import { Rating, type Card } from "@/schema";
import { SessionCard, SessionStats } from "@/utils/session";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsRight, CircleAlert, Undo } from "lucide-react";
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
      className="relative col-span-12 flex flex-col gap-x-4 gap-y-2"
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
      >
        <EditableFlashcard
          form={form}
          setOpen={setOpen}
          open={open}
          editing={editing}
        />
      </div>

      <div className="h-40 sm:hidden"></div>
      <div className="fixed bottom-8 z-20 w-full pr-4 sm:static sm:mx-auto sm:w-max">
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
