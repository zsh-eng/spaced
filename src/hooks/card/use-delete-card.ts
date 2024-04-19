import { type Card } from "@/schema";
import { getNextSessionData } from "@/utils/session";
import { ReactQueryOptions, trpc } from "@/utils/trpc";
import { toast } from "sonner";

type DeleteMutationOptions = ReactQueryOptions["card"]["delete"];
type DeleteMutation = ReturnType<typeof trpc.card.delete.useMutation>;

const THRESHOLD_FOR_REFETCH = 10;

/**
 * Hook to delete a {@link Card}.
 */
export function useDeleteCard(options?: DeleteMutationOptions): DeleteMutation {
  const utils = trpc.useUtils();
  const undo = trpc.card.undoDelete.useMutation();

  return trpc.card.delete.useMutation({
    ...options,
    onMutate: async (id: string) => {
      await utils.card.sessionData.cancel();
      const sessionData = utils.card.sessionData.getData();
      if (!sessionData) {
        return;
      }

      // It just so happens that getNextSessionData can be used for deletion
      // If we change the behaviour of grading cards, we may need to create a new function
      const nextSessionData = getNextSessionData(sessionData, id);
      utils.card.sessionData.setData(undefined, nextSessionData);

      // Currently, I place this undo functionality here because
      // The previous values are readily available
      // I'm not sure what the best approach is, especially if we click on an older toast
      toast.success("Card deleted.", {
        action: {
          label: "Undo",
          onClick: () => {
            undo.mutate(id);
            utils.card.sessionData.setData(undefined, sessionData);
          },
        },
      });

      return {
        previousSession: sessionData,
      };
    },

    onSuccess: () => {
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
      utils.card.sessionData.invalidate();
    },

    onError: (error, _variables, context) => {
      console.error(error.message);

      if (context?.previousSession) {
        utils.card.sessionData.setData(undefined, context.previousSession);
      }
    },
  });
}
