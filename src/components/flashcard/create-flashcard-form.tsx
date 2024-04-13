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
import { useRef, useState } from "react";
import { toast } from "sonner";

const MAX_INPUT_LENGTH = 20000;

export default function CreateFlashcardForm() {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");

  const cardRef = useRef<HTMLDivElement>(null);

  const createCardMutation = useCreateCard();

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

    await createCardMutation.mutateAsync({
      question,
      answer,
    });

    setQuestion("");
    setAnswer("");
  };

  return (
    <UiCard className="w-full md:w-[36rem]" ref={cardRef}>
      <UiCardHeader>
        <UiCardTitle>
          <div className="flex justify-between">
            <p className="">Create</p>
          </div>
        </UiCardTitle>
        <UiCardDescription>
          <p>Fill in the question and answer to your flashcard.</p>
        </UiCardDescription>
      </UiCardHeader>

      <UiCardContent className="flex min-h-96 flex-col gap-y-4">
        <Textarea
          className="h-40 resize-none border-0"
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
          size="lg"
          variant="outline"
          onClick={() => onCreate()}
        >
          Create
        </Button>
      </UiCardContent>
    </UiCard>
  );
}
