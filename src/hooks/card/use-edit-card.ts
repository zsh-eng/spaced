import { getSessionCardWithContentId } from "@/utils/session";
import { ReactQueryOptions, trpc } from "@/utils/trpc";
import { produce } from "immer";
import { toast } from "sonner";

type EditCardMutationOptions = ReactQueryOptions["card"]["edit"];
type EditMutation = ReturnType<typeof trpc.card.edit.useMutation>;

export function useEditCard(options?: EditCardMutationOptions): EditMutation {
  const utils = trpc.useUtils();
  return trpc.card.edit.useMutation({
    ...options,
    async onMutate({ cardContentId, question, answer }) {
      await utils.card.sessionData.cancel();
      const sessionData = utils.card.sessionData.getData();
      if (!sessionData) return;

      const nextCards = produce(sessionData, (draft) => {
        let index = draft.newCards.findIndex(
          (card) => card.card_contents.id === cardContentId,
        );

        if (index !== -1) {
          draft.newCards[index].card_contents.question = question;
          draft.newCards[index].card_contents.answer = answer;
          return;
        }

        index = draft.reviewCards.findIndex(
          (card) => card.card_contents.id === cardContentId,
        );
        if (index === -1) {
          throw new Error("Card content not found.");
        }

        draft.reviewCards[index].card_contents.question = question;
        draft.reviewCards[index].card_contents.answer = answer;
      });

      utils.card.sessionData.setData(undefined, nextCards);
      return { previousSession: sessionData };
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
