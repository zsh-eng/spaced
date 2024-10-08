"use client";

import { isSpecialDeck } from "@/common";
import AIGenerateFlashcardDialog from "@/components/flashcard/ai-generate-flashcard-dialog";
import { FormMultiSelect } from "@/components/form/form-multi-select";
import { FormTextarea } from "@/components/form/form-textarea";
import { FormTextareaImageUpload } from "@/components/form/form-textarea-image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UiCard } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { gridChildGrid } from "@/components/ui/grid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UserImagesDialog from "@/components/user-images-dialog";
import {
  CreateManyCardsFormValues,
  ObsidianCardMetadata,
  cardContentDefaultValues,
  createManyCardsDefaultValues,
  createManyCardsFormSchema,
} from "@/form";
import { useCreateManyCard } from "@/hooks/card/use-create-many-card";
import { useSubscribeObsidian } from "@/hooks/use-subscribe-obsidian";
import { OBSIDIAN_ACTION } from "@/utils/obsidian";
import { extractCardContentFromMarkdownString } from "@/utils/obsidian-parse";
import { trpc } from "@/utils/trpc";
import { cn } from "@/utils/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, SendHorizonal, Trash, TrashIcon } from "lucide-react";
import { ChangeEventHandler, useEffect } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CreateManyFlashcardForm() {
  const { data: decks = [], isLoading: isLoadingDeck } =
    trpc.deck.all.useQuery();
  const deckSelectData = decks
    .filter((deck) => !isSpecialDeck(deck.id))
    .map((deck) => ({
      value: deck.id,
      label: deck.name,
    }));

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
        form.resetField("metadata");
        form.resetField("cardInputs");
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

  useSubscribeObsidian(OBSIDIAN_ACTION.INSERT_CARDS, async (data) => {
    const contents = extractCardContentFromMarkdownString(data.content);
    append(contents);

    const metadata: ObsidianCardMetadata = {
      source: "obsidian",
      tags: data.tags,
      filename: data.filename,
      sourceId: data.id,
    };
    form.setValue("metadata", metadata);

    return {
      success: true,
    };
  });

  const metadata = form.getValues("metadata");

  useEffect(() => {
    const shortcutListener = (e: KeyboardEvent) => {
      // Use code because MacOS transforms the Option+Space to another key
      if (e.code === "Space" && e.altKey) {
        console.log("pressed alt + space");
        append({
          ...cardContentDefaultValues,
        });
      }
    };

    document.addEventListener("keydown", shortcutListener);
    return () => {
      document.removeEventListener("keydown", shortcutListener);
    };
  }, [append]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(gridChildGrid)}
      >
        <div className="top-12 col-span-12 mb-4 flex max-w-lg flex-col gap-y-2 justify-self-center 2xl:sticky 2xl:col-span-3 2xl:justify-self-end">
          {/* Import markdown file input */}
          <div className="mb-2 text-xl font-bold">Bulk Create Cards</div>

          <FormMultiSelect
            name="deckIds"
            label="Deck"
            form={form}
            disabled={isLoading}
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
              type="button"
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
              type="button"
              disabled={form.getValues("cardInputs").length === 0 || isLoading}
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete All
            </Button>

            <AIGenerateFlashcardDialog
              onGeneratedCards={({ cards }) => {
                const previous = form.getValues("cardInputs");
                append(cards);

                toast.success(`Generated ${cards.length} cards with AI.`, {
                  action: {
                    label: "Undo",
                    onClick: () => form.setValue("cardInputs", previous),
                  },
                });
              }}
            />

            <UserImagesDialog />
          </div>

          <div className="flexm mt-2">
            <Badge variant="outline" className="w-max">
              {fields.length} cards
            </Badge>
            {metadata && (
              <>
                <Badge variant="dot" className="w-max">
                  {metadata.source}
                </Badge>
                <Badge variant="outline" className="w-max">
                  {metadata.filename}
                </Badge>
                {metadata.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="w-max">
                    {tag}
                  </Badge>
                ))}
              </>
            )}
          </div>
        </div>

        <div className={cn("col-start-1 col-end-13 gap-y-6 2xl:col-start-4")}>
          {/* Card inputs */}
          <section
            className="grid grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2 lg:grid-cols-3 lg:px-4"
            onKeyDown={(e) => e.stopPropagation()}
          >
            {fields.map((item, index) => (
              <UiCard
                className={cn("flex flex-col px-4 py-4 text-sm")}
                key={item.id}
                onKeyDown={(e) => {
                  if (e.code === "KeyD" && e.altKey) {
                    remove(index);
                    if (index > 0) {
                      form.setFocus(`cardInputs.${index - 1}.question`);
                    } else if (index === 0 && fields.length > 0) {
                      form.setFocus(`cardInputs.${0}.question`);
                    }
                    e.preventDefault();
                  }
                }}
              >
                <FormTextareaImageUpload
                  className="h-40 resize-none border-0"
                  name={`cardInputs.${index}.question`}
                  label="Question"
                  form={form}
                  disabled={isLoading}
                />

                <hr className="mx-auto w-8" />

                <FormTextareaImageUpload
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
                  type="button"
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
