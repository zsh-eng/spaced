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
import { useCallback, useEffect, useRef, useState } from 'react';

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
  cardContent,
  onRating,
  schemaRatingToReviewDay,
}: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const initialQuestion = cardContent.question;
  const initialAnswer = cardContent.answer;
  const [content, setContent] = useState({
    question: initialQuestion,
    answer: initialAnswer,
  });
  const { question, answer } = content;
  const isSame = initialQuestion === question && initialAnswer === answer;

  const editCardMutation = useEditCard();
  const handleEdit = useCallback(() => {
    if (isSame) return;
    editCardMutation.mutate({
      cardContentId: cardContent.id,
      question,
      answer,
    });
  }, [isSame, editCardMutation, question, answer, cardContent.id]);

  useKeydownRating(onRating, open, () => setOpen(!open));
  useClickOutside({
    ref: cardRef,
    enabled: editing,
    callback: () => setEditing(false),
  });

  useEffect(() => {
    setContent({
      question: cardContent.question,
      answer: cardContent.answer,
    });
  }, [cardContent.question, cardContent.answer]);

  useEffect(() => {
    setOpen(false);
  }, [card.id]);

  useEffect(() => {
    if (!editing) handleEdit();
  }, [editing, handleEdit]);

  return (
    <UiCard className='w-full lg:w-[36rem]'>
      <UiCardHeader>
        <UiCardTitle>
          <div className='flex justify-between'>
            Question
            <Toggle
              aria-label='toggle edit'
              pressed={editing}
              onPressedChange={(pressed) => setEditing(pressed)}
            >
              <FilePenIcon className='h-4 w-4' strokeWidth={1.5} />
            </Toggle>
          </div>
        </UiCardTitle>
        <UiCardDescription>{card.state}</UiCardDescription>
        {/* <UiCardDescription>{cardContent.question}</UiCardDescription> */}
      </UiCardHeader>
      <UiCardContent className='flex flex-col gap-y-2 h-96' ref={cardRef}>
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
