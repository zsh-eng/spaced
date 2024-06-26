import { ReactQueryOptions, RouterInputs, trpc } from "@/utils/trpc";

type CreateManyMutationOptions = ReactQueryOptions["card"]["createMany"];
type CreateManyMutation = ReturnType<typeof trpc.card.createMany.useMutation>;
export type CreateManyMutationInput = RouterInputs["card"]["createMany"];

/**
 * Hook to create many cards at once.
 */
export function useCreateManyCard(
  options?: CreateManyMutationOptions,
): CreateManyMutation {
  const utils = trpc.useUtils();

  return trpc.card.createMany.useMutation({
    ...options,
    onSuccess: async () => {
      await utils.card.sessionData.invalidate();
    },

    onError: (error) => {
      console.error(error.message);
    },
  });
}
