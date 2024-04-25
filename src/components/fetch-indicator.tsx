import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { cn } from "@/utils/ui";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Loader2 } from "lucide-react";

export function FetchIndicator() {
  const { isLoading, isFetching } = trpc.card.sessionData.useQuery();

  const isMobile = useMediaQuery("only screen and (max-width: 640px)");

  return isMobile ? null : (
    <Button
      className={cn(
        "fixed right-4 top-16 cursor-default transition duration-500",
        !isLoading && isFetching ? "opacity-100" : "opacity-0",
      )}
      variant="secondary"
    >
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Fetching Cards...
    </Button>
  );
}

FetchIndicator.displayName = "FetchIndicator";
