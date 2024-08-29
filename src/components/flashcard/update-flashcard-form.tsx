"use client";

import { FormMarkdownEditor } from "@/components/form/form-markdown-editor";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { UpdateCardFormValues, updateCardFormSchema } from "@/form";
import { useEditCard } from "@/hooks/card/use-edit-card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

type UpdateFlashcardFormProps = {
  question: string;
  answer: string;
  cardContentId: string;
  onEdit?: () => void;
};

export default function UpdateFlashcardForm({
  question,
  answer,
  cardContentId,
  onEdit,
}: UpdateFlashcardFormProps) {
  const form = useForm<UpdateCardFormValues>({
    resolver: zodResolver(updateCardFormSchema),
    defaultValues: {
      question: question,
      answer: answer,
      cardContentId: cardContentId,
    },
  });

  const editCardMutation = useEditCard();
  const isLoading = editCardMutation.isPending;

  const onSubmit: SubmitHandler<UpdateCardFormValues> = async (data) => {
    try {
      await editCardMutation.mutateAsync({
        cardContentId: data.cardContentId,
        question: data.question,
        answer: data.answer,
      });
      onEdit?.();

      // We don't maintain the history here for the deck page
      // It's unnecessary complication
      const rollback = () => {
        // We have to set the value before the re-render triggers
        form.setValue("question", data.question);
        form.setValue("answer", data.answer);
      };

      toast.success("Card updated.", {
        action: {
          label: "Undo",
          onClick: rollback,
        },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create card");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <FormMarkdownEditor
          key={cardContentId + "question"}
          name="question"
          label="Question"
          form={form}
          disabled={isLoading}
          border={true}
          className="max-h-48 overflow-y-auto"
        />
        <FormMarkdownEditor
          key={cardContentId + "answer"}
          name="answer"
          label="Answer"
          form={form}
          disabled={isLoading}
          border={true}
          className="max-h-48 overflow-y-auto"
        />
        <Button
          className="mt-4 w-full"
          disabled={isLoading}
          type="submit"
          size="lg"
          variant="outline"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Edit
        </Button>
      </form>
    </Form>
  );
}

UpdateFlashcardForm.displayName = "CreateFlashcardForm";
