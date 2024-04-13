import { ReactQueryOptions, trpc } from "@/utils/trpc";

type CreateMutationOptions = ReactQueryOptions["card"]["create"];
type CreateMutation = ReturnType<typeof trpc.card.create.useMutation>;

/**
 * Hook to create a card.
 */
export function useCreateCard(options?: CreateMutationOptions): CreateMutation {
  const utils = trpc.useUtils();

  return trpc.card.create.useMutation({
    ...options,
    onSuccess: async () => {
      await utils.card.all.refetch();
      await utils.card.stats.refetch();
    },

    onError: (error) => {
      console.error(error.message);
    },
  });
}
