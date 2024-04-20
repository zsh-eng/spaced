"use client";

import CreateFlashcardSimpleForm from "@/components/flashcard/create-flashcard-simple-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreateManyMutationInput,
  useCreateManyCard,
} from "@/hooks/card/use-create-many-card";
import { extractCardContentFromMarkdownString } from "@/utils/obsidian-parse";
import { cn } from "@/utils/ui";
import { Plus, SendHorizonal, TrashIcon } from "lucide-react";
import { ChangeEventHandler, useEffect, useState } from "react";
import { toast } from "sonner";

export type FormValues = {
  id: string;
} & CreateManyMutationInput[number];

function newFormValues(values?: Partial<FormValues>): FormValues {
  return {
    id: crypto.randomUUID(),
    question: "",
    answer: "",
    ...values,
  };
}

export default function CreateManyFlashcardForm() {
  const [forms, setForms] = useState<FormValues[]>([newFormValues()]);
  const [isPressed, setIsPressed] = useState(false);
  const createManyMutation = useCreateManyCard();
  const isPending = createManyMutation.isPending;

  const handleAddForm = () => {
    setIsPressed(true);
    setForms((forms) => [...forms, newFormValues()]);
    setTimeout(() => setIsPressed(false), 200);
  };

  const handleEdit = (values: FormValues) => {
    setForms((forms) =>
      forms.map((form) => (form.id === values.id ? values : form)),
    );
  };

  const handleDelete = (id: string) => {
    setForms((forms) => forms.filter((form) => form.id !== id));
  };

  const handleDeleteAll = () => {
    toast.success("All forms deleted.", {
      action: {
        label: "Undo",
        onClick: () => setForms(forms),
      },
    });
    setForms([]);
  };

  const handleSubmit = () => {
    toast.promise(createManyMutation.mutateAsync(forms), {
      loading: "Creating flashcards...",
      success: () => {
        setForms([]);
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
      const values = contents.map((content) => newFormValues(content));
      setForms((forms) => [...forms, ...values]);
    };
    reader.onerror = (e) => {
      console.error(e);
      toast.error("Failed to read file.");
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== " ") {
        return;
      }
      handleAddForm();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col items-center gap-y-6">
      <div className="flex flex-col gap-y-2">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="markdownFile">Markdown File Upload</Label>
          <Input
            id="markdownFile"
            type="file"
            accept=".md"
            onChange={handleFileUpload}
          />
        </div>
        <div className="flex w-full min-w-80 flex-col  justify-center gap-x-2 gap-y-2 md:flex-row">
          <Button
            onClick={() => handleAddForm()}
            variant="outline"
            className={cn("transition", isPressed ? "scale-105" : "")}
            disabled={isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>

          <Button
            variant="outline"
            disabled={forms.length === 0 || isPending}
            onClick={() => handleSubmit()}
          >
            <SendHorizonal className="mr-2 h-4 w-4" />
            Create All
          </Button>

          <Button
            variant="outline"
            onClick={() => handleDeleteAll()}
            disabled={forms.length === 0 || isPending}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete All
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2 xl:grid-cols-3">
        {forms.map(({ id, ...values }) => (
          <CreateFlashcardSimpleForm
            isPending={isPending}
            key={id}
            values={values}
            onChange={(values) => handleEdit({ id, ...values })}
            onDelete={() => handleDelete(id)}
          />
        ))}
      </section>
    </div>
  );
}

CreateManyFlashcardForm.displayName = "CreateManyFlashcardForm";
