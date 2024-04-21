"use client";

import { FormTextInput } from "@/components/form/form-input";
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
import { DeckFormValues, deckDefaultValues, deckFormSchema } from "@/form";
import { useCreateDeck } from "@/hooks/deck/use-create-deck";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

export function CreateDeckForm() {
  const createDeckMutation = useCreateDeck();
  const form = useForm<DeckFormValues>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: deckDefaultValues,
  });

  const isLoading = createDeckMutation.isPending;

  const onSubmit: SubmitHandler<DeckFormValues> = (data) => {
    toast.promise(createDeckMutation.mutateAsync(data), {
      loading: "Creating deck...",
      success: () => {
        form.reset();
        return "Deck created.";
      },
      error: "Failed to create deck.",
    });
  };

  return (
    <UiCard className="col-span-12 w-full max-w-xl self-start justify-self-center border-0 md:border">
      <UiCardHeader className="px-2 md:px-6">
        <UiCardTitle>Create</UiCardTitle>
        <UiCardDescription>
          Provide a name and description for your new deck.
        </UiCardDescription>
      </UiCardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <UiCardContent className="flex h-full flex-col gap-y-4 px-2 md:px-6">
            <FormTextInput
              name="name"
              label="Name"
              form={form}
              disabled={isLoading}
            />
            <hr className="mx-auto w-8" />
            <FormTextarea
              name="description"
              label="Description"
              form={form}
              disabled={isLoading}
            />
          </UiCardContent>

          <UiCardFooter className="px-2 md:px-6">
            <Button
              className="mt-4 w-full"
              disabled={isLoading}
              size="lg"
              variant="outline"
              type="submit"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </UiCardFooter>
        </form>
      </Form>
    </UiCard>
  );
}

CreateDeckForm.displayName = "CreateDeckForm";
