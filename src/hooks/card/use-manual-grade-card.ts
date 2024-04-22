import {
  removeCardFromSessionData,
  updateCardInSessionData,
} from "@/utils/session";
import { ReactQueryOptions, trpc } from "@/utils/trpc";
import { toast } from "sonner";

type ManualGradeMutationOptions = ReactQueryOptions["card"]["manualGrade"];
type ManualGradeMutation = ReturnType<typeof trpc.card.manualGrade.useMutation>;

const THRESHOLD_FOR_REFETCH = 10;

/**
 * Hook to grade a card.
 */
export function useManualGradeCard(
  options?: ManualGradeMutationOptions,
): ManualGradeMutation {
  const utils = trpc.useUtils();
  // No optimistic updates for manual grading
  return trpc.card.manualGrade.useMutation({
    ...options,
    async onSuccess() {
      await utils.card.sessionData.cancel();
      const sessionData = utils.card.sessionData.getData();
      if (!sessionData) return;

      await utils.card.sessionData.invalidate();
    },

    async onError(err, _variables, context) {
      console.error(err.message);
      toast.error(err.message);
    },
  });
}
