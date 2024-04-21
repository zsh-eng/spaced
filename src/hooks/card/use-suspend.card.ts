import { getNextSessionData } from "@/utils/session";
import { ReactQueryOptions, trpc } from "@/utils/trpc";
import { toast } from "sonner";

type SuspendCardMutationOptions = ReactQueryOptions["card"]["suspend"];
type SuspendMutation = ReturnType<typeof trpc.card.suspend.useMutation>;

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
