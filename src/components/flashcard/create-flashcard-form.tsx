"use client";

import { FormTextarea } from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import {
  UiCard,
  UiCardContent,
  UiCardDescription,
  UiCardFooter,
  UiCardHeader,
  UiCardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useCreateCard } from "@/hooks/card/use-create-card";
import { useDeleteCard } from "@/hooks/card/use-delete-card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const MAX_INPUT_LENGTH = 20000;

const formSchema = z.object({
  question: z
    .string()
    .min(1, {
      message: "Question is required.",
    })
    .max(MAX_INPUT_LENGTH, {
      message: "Question is too long.",
    }),
  answer: z
    .string()
    .min(1, {
      message: "Answer is required.",
    })
    .max(MAX_INPUT_LENGTH, {
      message: "Answer is too long.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateFlashcardForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const createCardMutation = useCreateCard();
  const deleteCardMutation = useDeleteCard();
  const isLoading =
    createCardMutation.isPending || deleteCardMutation.isPending;

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const card = await createCardMutation.mutateAsync(data);
      const rollback = () => {
        deleteCardMutation.mutate(card.cards.id);
        form.setValue("question", data.question);
        form.setValue("answer", data.answer);
      };

      toast.success("Card created.", {
        action: {
          label: "Undo",
          onClick: rollback,
        },
      });

      form.reset();
    } catch (err) {
      toast.error("Failed to create card");
    }
  };

  return (
    <UiCard className="w-full border-0 md:w-[36rem] md:border" ref={cardRef}>
      <UiCardHeader className="px-2 md:px-6">
        <UiCardTitle>Create</UiCardTitle>
        <UiCardDescription>
          Fill in the question and answer to your flashcard.
        </UiCardDescription>
      </UiCardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <UiCardContent className="flex min-h-96 flex-col gap-y-4 px-2 md:px-6">
            <FormTextarea
              name="question"
              label="Question"
              form={form}
              disabled={isLoading}
            />
            <FormTextarea
              name="answer"
              label="Answer"
              form={form}
              disabled={isLoading}
            />
          </UiCardContent>
          <UiCardFooter className="px-2 md:px-6">
            <Button
              className="mt-4 w-full"
              disabled={isLoading}
              type="submit"
              size="lg"
              variant="outline"
            >
              {createCardMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create
            </Button>
          </UiCardFooter>
        </form>
      </Form>
    </UiCard>
  );
}

CreateFlashcardForm.displayName = "CreateFlashcardForm";
