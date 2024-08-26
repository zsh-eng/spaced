"use client";

import { FormMarkdownEditor } from "@/components/form/form-markdown-editor";
import { FormMultiSelect } from "@/components/form/form-multi-select";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  CreateCardFormValues,
  createCardDefaultValues,
  createCardFormSchema,
} from "@/form";
import { useCreateCard } from "@/hooks/card/use-create-card";
import { useDeleteCard } from "@/hooks/card/use-delete-card";
import { useHistory } from "@/providers/history";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

type CreateFlashcardFormProps = {
  deckId?: string;
};

export default function CreateFlashcardForm({
  deckId,
}: CreateFlashcardFormProps) {
  const { data: decks = [], isLoading: isLoadingDeck } =
    trpc.deck.all.useQuery();
  const deckSelectData = decks.map((deck) => ({
    value: deck.id,
    label: deck.name,
  }));

  const form = useForm<CreateCardFormValues>({
    resolver: zodResolver(createCardFormSchema),
    defaultValues: {
      ...createCardDefaultValues,
      deckIds: deckId ? [deckId] : createCardDefaultValues.deckIds,
    },
  });

  // This is a hack to force the markdown editor to re-render
  const [markdownEditorKey, setMarkdownEditorKey] = useState<string>(
    crypto.randomUUID(),
  );

  const history = useHistory();
  const createCardMutation = useCreateCard();
  const deleteCardMutation = useDeleteCard();
  const isLoading =
    createCardMutation.isPending || deleteCardMutation.isPending;

  const onSubmit: SubmitHandler<CreateCardFormValues> = async (data) => {
    try {
      const card = await createCardMutation.mutateAsync(data);
      const id = history.add("create", card);

      const rollback = () => {
        // We have to set the value before the re-render triggers
        form.setValue("question", data.question);
        form.setValue("answer", data.answer);
        form.setValue("deckIds", data.deckIds);
        history.undo(id);

        setTimeout(() => {
          setMarkdownEditorKey(crypto.randomUUID());
        }, 500);
      };

      toast.success("Card created.", {
        action: {
          label: "Undo",
          onClick: rollback,
        },
      });

      form.reset();
      setMarkdownEditorKey(crypto.randomUUID());
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
        <FormMultiSelect
          name="deckIds"
          label="Deck"
          form={form}
          defaultValues={deckSelectData.filter((deck) =>
            (form.getValues("deckIds") ?? []).includes(deck.value),
          )}
          disabled={isLoading}
          data={deckSelectData}
        />

        <FormMarkdownEditor
          key={markdownEditorKey + "question"}
          name="question"
          label="Question"
          form={form}
          disabled={isLoading}
          border={true}
          className="max-h-48 overflow-y-auto"
        />
        <FormMarkdownEditor
          key={markdownEditorKey + "answer"}
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
          {createCardMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create
        </Button>
      </form>
    </Form>
  );
}

CreateFlashcardForm.displayName = "CreateFlashcardForm";
