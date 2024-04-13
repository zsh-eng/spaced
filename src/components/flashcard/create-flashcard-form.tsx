"use client";

import { Button } from "@/components/ui/button";
import {
  UiCard,
  UiCardContent,
  UiCardDescription,
  UiCardHeader,
  UiCardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCard } from "@/hooks/card/use-create-card";
import { useDeleteCard } from "@/hooks/card/use-delete-card";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const MAX_INPUT_LENGTH = 20000;

export default function CreateFlashcardForm() {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");

  const cardRef = useRef<HTMLDivElement>(null);

  const createCardMutation = useCreateCard();
  const deleteCardMutation = useDeleteCard();
  const isLoading =
    createCardMutation.isPending || deleteCardMutation.isPending;

  const onCreate = async () => {
    if (!question || !answer) {
      toast.error("Please fill in the question and answer.");
      return;
    }

    if (question.length > MAX_INPUT_LENGTH) {
      toast.error("Question is too long.");
      return;
    }

    if (answer.length > MAX_INPUT_LENGTH) {
      toast.error("Answer is too long.");
      return;
    }

    try {
      const card = await createCardMutation.mutateAsync({
        question,
        answer,
      });

      const rollback = () => {
        deleteCardMutation.mutate(card.cards.id);
        setQuestion(card.card_contents.question);
        setAnswer(card.card_contents.answer);
      };

      toast.success("Card created.", {
        action: {
          label: "Undo",
          onClick: rollback,
        },
      });
      setQuestion("");
      setAnswer("");
    } catch (err) {
      toast.error("Failed to create card");
    }
  };

  return (
    <UiCard className="w-full md:w-[36rem]" ref={cardRef}>
      <UiCardHeader>
        <UiCardTitle>Create</UiCardTitle>
        <UiCardDescription>
          Fill in the question and answer to your flashcard.
        </UiCardDescription>
      </UiCardHeader>

      <UiCardContent className="flex min-h-96 flex-col gap-y-4">
        <Textarea
          className="h-40 resize-none border-0"
          disabled={isLoading}
          spellCheck="false"
          placeholder="Question"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
          }}
          onKeyDown={(e) => e.stopPropagation()}
        />

        <hr className="mx-auto w-8" />

        <Textarea
          className="h-40 resize-none border-0"
          disabled={isLoading}
          spellCheck="false"
          placeholder="Answer"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
          }}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </UiCardContent>

      <UiCardContent className="h-24">
        <Button
          className="mt-4 w-full"
          disabled={isLoading || !question || !answer}
          size="lg"
          variant="outline"
          onClick={() => onCreate()}
        >
          {createCardMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create
        </Button>
      </UiCardContent>
    </UiCard>
  );
}
