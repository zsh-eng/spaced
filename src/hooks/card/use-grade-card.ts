import { removeCardFromSessionData } from "@/utils/session";
import { ReactQueryOptions, trpc } from "@/utils/trpc";
import { toast } from "sonner";

type GradeMutationOptions = ReactQueryOptions["card"]["grade"];
type GradeMutation = ReturnType<typeof trpc.card.grade.useMutation>;

const THRESHOLD_FOR_REFETCH = 10;

/**
 * Hook to grade a card.
 */
export function useGradeCard(options?: GradeMutationOptions): GradeMutation {
  const utils = trpc.useUtils();
  return trpc.card.grade.useMutation({
    ...options,
    async onMutate({ id }) {
      await utils.card.sessionData.cancel();
      const sessionData = utils.card.sessionData.getData();
      if (!sessionData) {
        return;
      }

      // We technically don't need the grade for optimistic updates
      const nextSessionData = removeCardFromSessionData(sessionData, id);
      utils.card.sessionData.setData(undefined, nextSessionData);

      return {
        previousSession: sessionData,
      };
    },

    async onSuccess() {
      await utils.card.sessionData.cancel();
      const sessionData = utils.card.sessionData.getData();
      // Refetch periodically to get more cards
      // We don't use infinite queries here because there is no pagination
      // As we grade cards, new cards will be returned from the server
      if (
        !sessionData ||
        sessionData.reviewCards.length + sessionData.newCards.length >
          THRESHOLD_FOR_REFETCH
      )
        return;

      await utils.card.sessionData.invalidate();
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
