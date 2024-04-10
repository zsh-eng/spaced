'use client';

import Flashcard from '@/components/flashcard/flashcard';
import { useGradeMutation } from '@/hooks/card/use-grade-mutation';
import { CardContent, type Rating } from '@/schema';
import { getReviewDayForEachRating } from '@/utils/fsrs';
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
  const schemaRatingToReviewDay = getReviewDayForEachRating(card);
  const isCard = card && cardContent;

  const onRating = (rating: Rating) => {
    const reviewDay = schemaRatingToReviewDay[rating];

    console.log(`Current card: ${card.id}`);
    console.log(`Next Card: ${cardsWithContent[1]?.cards.id}`);

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
    console.log(`Rating: ${rating}`);
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
