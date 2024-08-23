import { ReactQueryOptions, trpc } from "@/utils/trpc";

type AIGenerateCardMutationOptions = ReactQueryOptions["card"]["aiGenerate"];
type AIGenerateMutation = ReturnType<typeof trpc.card.aiGenerate.useMutation>;

/**
 * Hook to use AI for generating flashcards.
 */
export function useAIGenerateCard(
  options?: AIGenerateCardMutationOptions,
): AIGenerateMutation {
  const utils = trpc.useUtils();

  return trpc.card.aiGenerate.useMutation({
    ...options,
    onError: (error) => {
      console.error(error.message);
    },
  });
}
