"use client";

import { FormSelect } from "@/components/form/form-select";
import { FormTextarea } from "@/components/form/form-textarea";
import { Button } from "@/components/ui/button";
import { UiCard } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { gridChildGrid } from "@/components/ui/grid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreateManyCardsFormValues,
  cardContentDefaultValues,
  createManyCardsDefaultValues,
  createManyCardsFormSchema,
} from "@/form";
import { useCreateManyCard } from "@/hooks/card/use-create-many-card";
import { allDeckDataToSelectData } from "@/utils/deck";
import { extractCardContentFromMarkdownString } from "@/utils/obsidian-parse";
import { trpc } from "@/utils/trpc";
import { cn } from "@/utils/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, SendHorizonal, Trash, TrashIcon } from "lucide-react";
import { ChangeEventHandler } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CreateManyFlashcardForm() {
  const { data: decks = [], isLoading: isLoadingDeck } =
    trpc.deck.all.useQuery();
  const deckSelectData = allDeckDataToSelectData(decks);

  const form = useForm<CreateManyCardsFormValues>({
    resolver: zodResolver(createManyCardsFormSchema),
    defaultValues: createManyCardsDefaultValues,
  });
  // https://www.react-hook-form.com/api/usefieldarray/
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cardInputs",
  });

  const createManyMutation = useCreateManyCard();
  const isLoading = createManyMutation.isPending;

  const handleDeleteAll = () => {
    const previous = form.getValues("cardInputs");
    form.setValue("cardInputs", []);

    toast.success("All forms deleted.", {
      action: {
        label: "Undo",
        onClick: () => form.setValue("cardInputs", previous),
      },
    });
  };

  const onSubmit: SubmitHandler<CreateManyCardsFormValues> = (data) => {
    toast.promise(createManyMutation.mutateAsync(data), {
      loading: "Creating flashcards...",
      success: () => {
        form.reset();
        return "Flashcards created.";
      },
      error: "Failed to create flashcards.",
    });
  };

  const handleFileUpload: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = extractCardContentFromMarkdownString(
        e.target?.result as string,
      );
      append(contents);
    };

    reader.onerror = (e) => {
      console.error(e);
      toast.error("Failed to read file.");
    };
    reader.readAsText(file);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(gridChildGrid)}
      >
        <div className="top-12 col-span-12 mb-4 flex flex-col gap-y-2 justify-self-center 2xl:sticky 2xl:col-span-3 2xl:justify-self-end">
          {/* Import markdown file input */}
          <div className="mb-2 text-xl font-bold">Bulk Create Cards</div>

          <FormSelect
            name="deckIds"
            label="Deck"
            form={form}
            disabled={isLoading}
            multiple={true}
            data={deckSelectData}
          />

          <div className="mt-2 grid w-full items-center gap-1.5">
            <Label htmlFor="markdownFile">Markdown File Upload</Label>
            <Input
              id="markdownFile"
              type="file"
              accept=".md"
              onChange={handleFileUpload}
            />
          </div>

          {/* Buttons for managing the many cards */}
          <div className="flex w-full flex-col flex-wrap justify-start gap-x-2 gap-y-2 md:flex-row">
            <Button
              onClick={() =>
                append({
                  ...cardContentDefaultValues,
                })
              }
              variant="outline"
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>

            <Button
              variant="outline"
              disabled={form.getValues("cardInputs").length === 0 || isLoading}
              type="submit"
            >
              <SendHorizonal className="mr-2 h-4 w-4" />
              Create All
            </Button>

            <Button
              variant="outline"
              onClick={() => handleDeleteAll()}
              disabled={form.getValues("cardInputs").length === 0 || isLoading}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete All
            </Button>
          </div>
        </div>

        <div className={cn("col-start-1 col-end-13 gap-y-6 2xl:col-start-4")}>
          {/* Card inputs */}
          <section
            className="grid grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2 2xl:grid-cols-3"
            onKeyDown={(e) => e.stopPropagation()}
          >
            {fields.map((item, index) => (
              <UiCard className={cn("flex flex-col px-4 py-4")} key={item.id}>
                <FormTextarea
                  className="h-40 resize-none border-0"
                  name={`cardInputs.${index}.question`}
                  label="Question"
                  form={form}
                  disabled={isLoading}
                />

                <hr className="mx-auto w-8" />

                <FormTextarea
                  className="h-40 resize-none border-0"
                  name={`cardInputs.${index}.answer`}
                  label="Answer"
                  form={form}
                  disabled={isLoading}
                />

                <Button
                  disabled={isLoading}
                  className="mt-2"
                  size="icon"
                  variant="outline"
                  onClick={() => remove(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </UiCard>
            ))}
          </section>
        </div>
      </form>
    </Form>
  );
}

CreateManyFlashcardForm.displayName = "CreateManyFlashcardForm";
