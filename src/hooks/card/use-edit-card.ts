import { ReactQueryOptions, trpc } from '@/utils/trpc';
import { produce } from 'immer';
import { toast } from 'sonner';

type EditCardMutationOptions = ReactQueryOptions['card']['edit'];
type EditMutation = ReturnType<typeof trpc.card.edit.useMutation>;

export function useEditCard(options?: EditCardMutationOptions): EditMutation {
  const utils = trpc.useUtils();
  return trpc.card.edit.useMutation({
    ...options,
    async onMutate({ cardContentId, question, answer }) {
      await utils.card.all.cancel();
      const allCards = utils.card.all.getData();
      if (!allCards) return;

      const nextCards = produce(allCards, (draft) => {
        const index = draft.findIndex(
          (card) => card.card_contents.id === cardContentId
        );
        draft[index].card_contents.question = question;
        draft[index].card_contents.answer = answer;
      });

      utils.card.all.setData(undefined, nextCards);
      toast.success('Card updated.');
      return { previousCards: allCards };
    },

    async onError(err, _variables, context) {
      console.error(err.message);
      toast.error(err.message);

      if (context?.previousCards) {
        utils.card.all.setData(undefined, context.previousCards);
      }
    },
  });
}
