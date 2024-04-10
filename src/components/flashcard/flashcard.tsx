'use client';

import AnswerButtons from '@/components/flashcard/answer-buttons';
import { Button } from '@/components/ui/button';
import {
  UiCard,
  UiCardContent,
  UiCardDescription,
  UiCardFooter,
  UiCardHeader,
  UiCardTitle,
} from '@/components/ui/card';
import EditableTextarea from '@/components/ui/editable-textarea';
import { Toggle } from '@/components/ui/toggle';
import { useEditCard } from '@/hooks/card/use-edit-card';
import { useClickOutside } from '@/hooks/use-click-outside';
import useKeydownRating from '@/hooks/use-keydown-rating';
import { CardContent, Rating, type Card } from '@/schema';
import { AllowDateString } from '@/utils/fsrs';
import { FilePenIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
    <UiCard className='w-full md:w-[36rem]' ref={cardRef}>
      <UiCardHeader>
        <UiCardTitle>
          <div className='flex justify-between'>
            Question
            <Toggle
              aria-label='toggle edit'
              pressed={editing}
              onPressedChange={(isEditing) => {
                setEditing(isEditing);
                if (!isEditing) handleEdit();
              }}
            >
              <FilePenIcon className='h-4 w-4' strokeWidth={1.5} />
            </Toggle>
          </div>
        </UiCardTitle>
        <UiCardDescription>{card.state}</UiCardDescription>
        {/* <UiCardDescription>{cardContent.question}</UiCardDescription> */}
      </UiCardHeader>
      <UiCardContent className='flex flex-col gap-y-4 h-96'>
        <EditableTextarea
          className='resize-none'
          spellCheck='false'
          editing={editing}
          setEditing={setEditing}
          placeholder='Question'
          value={question}
          onChange={(e) => {
            setContent((prev) => ({ ...prev, question: e.target.value }));
          }}
          onKeyDown={(e) => e.stopPropagation()}
        />

        <hr />

        {open && (
          <EditableTextarea
            className='resize-none'
            spellCheck='false'
            editing={editing}
            setEditing={setEditing}
            placeholder='Answer'
            value={answer}
            onChange={(e) => {
              setContent((prev) => ({ ...prev, answer: e.target.value }));
            }}
            onKeyDown={(e) => e.stopPropagation()}
          />
        )}
      </UiCardContent>

      <UiCardFooter>
        {open ? (
          <AnswerButtons
            schemaRatingToReviewDay={schemaRatingToReviewDay}
            onRating={onRating}
          />
        ) : (
          <Button
            variant='outline'
            className='w-full'
            onClick={() => setOpen(true)}
          >
            Press space to open
          </Button>
        )}
      </UiCardFooter>
    </UiCard>
  );
}

Flashcard.displayName = 'Flashcard';
