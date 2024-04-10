'use client';

import Flashcard from '@/components/flashcard/flashcard';
import { useGradeMutation } from '@/hooks/card/use-grade-mutation';
import { CardContent, type Rating } from '@/schema';
import { getReviewDateForEachRating } from '@/utils/fsrs';
import { trpc } from '@/utils/trpc';
import { intlFormatDistance } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {};

export default function FlashcardBox({}: Props) {
  const [open, setOpen] = useState(false);
  const { data: cardsWithContent = [], isLoading } = trpc.card.all.useQuery();
  const gradeMutation = useGradeMutation();

  if (isLoading || cardsWithContent.length === 0) {
    return <div>Loading...</div>;
  }

  const { cards: card, card_contents: cardContent } = cardsWithContent[0]!;
  const schemaRatingToReviewDay = getReviewDateForEachRating(card);
  const isCard = card && cardContent;

  const onRating = (rating: Rating) => {
    const reviewDay = schemaRatingToReviewDay[rating];
    gradeMutation.mutate({
      grade: rating,
      id: card.id,
    });

    toast(`Card marked as ${rating}.`, {
      action: {
        label: 'Undo',
        onClick: () => {},
      },
      description: `You'll see this again ${intlFormatDistance(
        reviewDay,
        new Date()
      )}`,
    });
    setOpen(false);
  };

  return (
    <div className='py-16'>
      {isCard && (
        <Flashcard
          card={card}
          cardContent={cardContent as CardContent}
          onRating={onRating}
          open={open}
          onOpen={() => setOpen(true)}
          schemaRatingToReviewDay={schemaRatingToReviewDay}
        />
      )}
    </div>
  );
}
