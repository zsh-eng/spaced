import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type State } from "@/schema";
import { SessionStats } from "@/utils/session";

type Props = {
  stats: SessionStats;
};

/**
 * Displays the number of cards in each {@link State}
 */
export default function CardCountBadge({ stats }: Props) {
  return (
    <div className="flex h-8 justify-center gap-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-text">
            <Badge
              variant="dot"
              className="h-full rounded-sm before:bg-accentblue"
            >
              {stats.new}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>New</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-text">
            <Badge
              variant="dot"
              className="h-full rounded-sm before:bg-destructive"
            >
              {stats.learning}{" "}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Learning</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-text">
            <Badge
              variant="dot"
              className="h-full rounded-sm before:bg-success"
            >
              {stats.review}{" "}
            </Badge>
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
