"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AICardOutput } from "@/form";
import { useAIGenerateCard } from "@/hooks/card/use-ai-generate-card";
import { cn } from "@/utils/ui";
import { TRPCClientError } from "@trpc/client";
import { Loader2, Sparkles } from "lucide-react";
import { ComponentProps, useState } from "react";
import { toast } from "sonner";

type AIGenerateFlashcardDialogProps = {
  /**
   * The function to handle the result of the generated flashcards.
   */
  onGeneratedCards: (output: AICardOutput) => void;
};

/**
 * Dialog for user to generate flashcards using AI
 */
export default function AIGenerateFlashcardDialog({
  onGeneratedCards,
}: AIGenerateFlashcardDialogProps) {
  const [query, setQuery] = useState("");
  const { mutateAsync, isPending } = useAIGenerateCard();
  const [open, setOpen] = useState(false);

  const onSubmit: ComponentProps<"form">["onSubmit"] = async (e) => {
    e.preventDefault();
    // Prevent triggering the parent form
    e.stopPropagation();
    if (!query) {
      toast.error("Please provide a query");
      return;
    }

    try {
      const output = await mutateAsync({ query });
      onGeneratedCards(output);
      setOpen(false);
    } catch (err) {
      if (err instanceof TRPCClientError) {
        if (err.message === "FORBIDDEN") {
          toast.error("Upgrade required.", {
            duration: 5000,
            description:
              "Unlock AI-powered flashcard generation by subscribing to our premium plan.",
          });
          return;
        }
      }
      throw err;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants({ size: "icon", variant: "ghost" }))}
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate with AI</DialogTitle>
          <DialogDescription>
            Provide the content and let AI generate the flashcards for you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter the content to generate flashcards..."
            className="text-sm"
          />
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
