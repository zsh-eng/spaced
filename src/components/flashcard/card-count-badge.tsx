import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type State } from "@/schema";
import { trpc } from "@/utils/trpc";

// Helper function to count the number of cards in a given state
function count<T>(arr: Array<T>, predicate: (item: T) => boolean) {
  return arr.reduce((count, item) => count + (predicate(item) ? 1 : 0), 0);
}

/**
 * Displays the number of cards in each {@link State}
 */
export default function CardCountBadge() {
  const { data: stats, isLoading: isLoadingStats } = trpc.card.stats.useQuery();

  if (!stats || isLoadingStats) {
    return null;
  }

  return (
    <div className="flex w-full justify-center gap-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-text">
            <Badge variant="accentblue">{stats.new}</Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>New</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-text">
            <Badge variant="destructive">{stats.learning} </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Learning</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-text">
            <Badge variant="success">{stats.review} </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Review</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

CardCountBadge.displayName = "CardCountBadge";
