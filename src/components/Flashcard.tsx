import { CardContent, type Card } from '@/schema';
import {
  UiCard,
  UiCardContent,
  UiCardDescription,
  UiCardFooter,
  UiCardHeader,
  UiCardTitle,
} from '@/components/ui/card';

type Props = {
  card: Card;
  cardContent: CardContent;
};

/**
 * Flashcard is the component that displays a {@link Card}
 */
const Flashcard = ({ card, cardContent }: Props) => {
  return (
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Question</UiCardTitle>
        <UiCardDescription>{card.state}</UiCardDescription>
        {/* <UiCardDescription>{cardContent.question}</UiCardDescription> */}
      </UiCardHeader>
      <UiCardContent className='flex flex-col gap-y-2'>
        <p>Question: {cardContent.question}</p>
        <p>Answer: {cardContent.answer}</p>
      </UiCardContent>
      <UiCardFooter>
        <p>Source: {cardContent.source}</p>
      </UiCardFooter>
    </UiCard>
  );
};

Flashcard.displayName = 'Flashcard';

export default Flashcard;
