"use client";

import CreateFlashcardSimpleForm from "@/components/flashcard/create-flashcard-simple-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/ui";
import { Plus, SendHorizonal, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type FormValues = {
  id: string;
  question: string;
  answer: string;
};

function newFormValues(): FormValues {
  return {
    id: crypto.randomUUID(),
    question: "",
    answer: "",
  };
}

export default function CreateManyFlashcardForm() {
  // We keep track of form state using uuids
  const [forms, setForms] = useState<FormValues[]>([newFormValues()]);
  const [isPressed, setIsPressed] = useState(false);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        handleAddForm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col items-center gap-y-6">
      <div className="flex w-full flex-col  justify-center gap-x-2 gap-y-2 md:flex-row">
        <Button
          onClick={() => handleAddForm()}
          variant="outline"
          className={cn("transition", isPressed ? "scale-105" : "")}
        >
          <Plus className="mr-2 h-4 w-4" />
          {"Press 'space' to Add"}
        </Button>

        <Button variant="outline" disabled={forms.length === 0}>
          <SendHorizonal className="mr-2 h-4 w-4" />
          Create All
        </Button>

        <Button variant="outline" onClick={() => handleDeleteAll()}>
          <TrashIcon className="mr-2 h-4 w-4" />
          Delete All
        </Button>
      </div>

      <section className="grid grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-2 xl:grid-cols-3">
        {forms.map(({ id, ...values }) => (
          <CreateFlashcardSimpleForm
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