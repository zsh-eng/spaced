import { getNextSessionData } from "@/utils/session";
import { ReactQueryOptions, trpc } from "@/utils/trpc";
import { toast } from "sonner";

type SuspendCardMutationOptions = ReactQueryOptions["card"]["suspend"];
type SuspendMutation = ReturnType<typeof trpc.card.suspend.useMutation>;

const THRESHOLD_FOR_REFETCH = 10;

export function useSuspendCard(
  options?: SuspendCardMutationOptions,
): SuspendMutation {
  const utils = trpc.useUtils();
  return trpc.card.suspend.useMutation({
    ...options,
    async onMutate({ id, suspendUntil }) {
      // Assume that we'll get the card on the next fetch
      await utils.card.sessionData.cancel();
      const sessionData = utils.card.sessionData.getData();
      if (!sessionData) {
        return;
      }

      const nextSessionData = getNextSessionData(sessionData, id);
      utils.card.sessionData.setData(undefined, nextSessionData);

      if (
        !sessionData ||
        sessionData.reviewCards.length + sessionData.newCards.length >
          THRESHOLD_FOR_REFETCH
      )
        return;

      await utils.card.sessionData.invalidate();

      return {
        previousSession: sessionData,
      };
    },

    async onError(err, _variables, context) {
      console.error(err.message);
      toast.error(err.message);

      if (context?.previousSession) {
        utils.card.sessionData.setData(undefined, context.previousSession);
      }
    },
  });
}
