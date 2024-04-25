import { THRESHOLD_CARDS_FOR_REFETCH } from "@/hooks/card/common";
import { type Card } from "@/schema";
import { removeCardFromSessionData } from "@/utils/session";
import { ReactQueryOptions, trpc } from "@/utils/trpc";

type DeleteMutationOptions = ReactQueryOptions["card"]["delete"];
type DeleteMutation = ReturnType<typeof trpc.card.delete.useMutation>;

/**
 * Hook to delete a {@link Card}.
 */
export function useDeleteCard(options?: DeleteMutationOptions): DeleteMutation {
  const utils = trpc.useUtils();
  // Instead this, procedure should be able to mark the card as deleted
  // or not deleted
  return trpc.card.delete.useMutation({
    ...options,
    onMutate: async ({ id, deleted = true }) => {
      if (!deleted) {
        return;
      }

      await utils.card.sessionData.cancel();
      const sessionData = utils.card.sessionData.getData();
      if (!sessionData) {
        return;
      }

      // It just so happens that getNextSessionData can be used for deletion
      // If we change the behaviour of grading cards, we may need to create a new function
      const nextSessionData = removeCardFromSessionData(sessionData, id);
      utils.card.sessionData.setData(undefined, nextSessionData);

      return {
        previousSession: sessionData,
      };
    },

    onSuccess: async (_data, { deleted = true }) => {
      if (!deleted) {
        await utils.card.sessionData.invalidate();
        return;
      }

      const sessionData = utils.card.sessionData.getData();
      // Refetch periodically to get more cards
      // We don't use infinite queries here because there is no pagination
      // As we grade cards, new cards will be returned from the server
      if (
        !sessionData ||
        sessionData.reviewCards.length + sessionData.newCards.length >
          THRESHOLD_CARDS_FOR_REFETCH
      )
        return;
      await utils.card.sessionData.invalidate();
    },

    onError: (error, _variables, context) => {
      console.error(error.message);

      if (context?.previousSession) {
        utils.card.sessionData.setData(undefined, context.previousSession);
      }
    },
  });
}
