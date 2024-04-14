"use client";

import { Button } from "@/components/ui/button";
import {
  UiCard,
  UiCardContent,
  UiCardDescription,
  UiCardHeader,
  UiCardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea, TextareaClasses } from "@/components/ui/textarea";
import { useCreateDeck } from "@/hooks/deck/use-create-deck";
import { RouterInputs } from "@/utils/trpc";
import { cn } from "@/utils/ui";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type DeckInputs = RouterInputs["deck"]["create"];

const emptyDeck = {
  name: "",
  description: "",
} satisfies DeckInputs;

export function CreateDeckForm() {
  const createDeckMutation = useCreateDeck();
  const [deck, setDeck] = useState<DeckInputs>(structuredClone(emptyDeck));
  const isLoading = createDeckMutation.isPending;

  const handleCreate = () => {
    toast.promise(createDeckMutation.mutateAsync(deck), {
      loading: "Creating deck...",
      success: () => {
        setDeck(structuredClone(emptyDeck));
        return "Deck created.";
      },
      error: "Failed to create deck.",
    });
  };

  return (
    <UiCard className="w-full md:w-[36rem]">
      <UiCardHeader>
        <UiCardTitle>Create</UiCardTitle>
        <UiCardDescription>
          Provide a name and description for your new deck.
        </UiCardDescription>
      </UiCardHeader>

      <UiCardContent className="flex min-h-96 flex-col gap-y-4">
        <Input
          placeholder="Name"
          className={cn("text-md")}
          value={deck.name}
          onChange={(e) => setDeck({ ...deck, name: e.target.value })}
        />
        <Textarea
          className="h-40 resize-none border-0"
          disabled={isLoading}
          spellCheck="false"
          placeholder="Description"
          value={deck.description}
          onChange={(e) => {
            setDeck({
              ...deck,
              description: e.target.value,
            });
          }}
          onKeyDown={(e) => e.stopPropagation()}
        />

        <hr className="mx-auto w-8" />
      </UiCardContent>

      <UiCardContent className="h-24">
        <Button
          className="mt-4 w-full"
          disabled={isLoading || !deck.name}
          size="lg"
          variant="outline"
          onClick={() => handleCreate()}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create
        </Button>
      </UiCardContent>
    </UiCard>
  );
}

CreateDeckForm.displayName = "CreateDeckForm";
