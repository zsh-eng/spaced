import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type State } from '@/schema';
import { trpc } from '@/utils/trpc';

// Helper function to count the number of cards in a given state
function count<T>(arr: Array<T>, predicate: (item: T) => boolean) {
  return arr.reduce((count, item) => count + (predicate(item) ? 1 : 0), 0);
}

/**
 * Displays the number of cards in each {@link State}
 */
export default function CardCountBadge() {
  const { data: cardsWithContent = [], isLoading } = trpc.card.all.useQuery();

  if (isLoading) {
    return null;
  }

  const newCount = count(
    cardsWithContent,
    (card) => card.cards.state === 'New'
  );
  const learningCount = count(
    cardsWithContent,
    (card) =>
      card.cards.state === 'Learning' || card.cards.state === 'Relearning'
  );
  const reviewCount = count(
    cardsWithContent,
    (card) => card.cards.state === 'Review'
  );

  return (
    <div className='flex gap-x-2 w-full justify-center'>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className='cursor-text'>
            <Badge variant='accentblue'>{newCount}</Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>New</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className='cursor-text'>
            <Badge variant='destructive'>{learningCount} </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Learning</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className='cursor-text'>
            <Badge variant='success'>{reviewCount} </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Review</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

CardCountBadge.displayName = 'CardCountBadge';
