"use client";

import { FormMarkdownEditor } from "@/components/form/form-markdown-editor";
import { FormSelect } from "@/components/form/form-select";
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
import {
  CreateCardFormValues,
  createCardDefaultValues,
  createCardFormSchema,
} from "@/form";
import { useCreateCard } from "@/hooks/card/use-create-card";
import { useDeleteCard } from "@/hooks/card/use-delete-card";
import { allDeckDataToSelectData } from "@/utils/deck";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CreateFlashcardForm() {
  const { data: decks = [], isLoading: isLoadingDeck } =
    trpc.deck.all.useQuery();
  const deckSelectData = allDeckDataToSelectData(decks);

  const form = useForm<CreateCardFormValues>({
    resolver: zodResolver(createCardFormSchema),
    defaultValues: createCardDefaultValues,
  });

  // This is a hack to force the markdown editor to re-render
  const [markdownEditorKey, setMarkdownEditorKey] = useState<string>(
    crypto.randomUUID(),
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const createCardMutation = useCreateCard();
  const deleteCardMutation = useDeleteCard();
  const isLoading =
    createCardMutation.isPending || deleteCardMutation.isPending;

  const onSubmit: SubmitHandler<CreateCardFormValues> = async (data) => {
    console.log(JSON.stringify(data, null, 2));
    try {
      const card = await createCardMutation.mutateAsync(data);
      const rollback = () => {
        // We have to set the value before the re-render triggers
        form.setValue("question", data.question);
        form.setValue("answer", data.answer);
        form.setValue("deckIds", data.deckIds);
        deleteCardMutation.mutate(card.cards.id);

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
            <FormSelect
              name="deckIds"
              label="Deck"
              form={form}
              disabled={isLoading}
              multiple={true}
              data={deckSelectData}
            />

            <FormMarkdownEditor
              key={markdownEditorKey + "question"}
              name="question"
              label="Question"
              form={form}
              disabled={isLoading}
            />
            <FormMarkdownEditor
              key={markdownEditorKey + "answer"}
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
