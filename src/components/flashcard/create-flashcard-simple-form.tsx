"use client";

import { FormValues } from "@/components/flashcard/create-many-flashcard-form";
import { Button } from "@/components/ui/button";
import { UiCardClasses } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/ui";
import { Trash } from "lucide-react";

type Values = Omit<FormValues, "id">;

type Props = {
  values: Values;
  onChange: (values: Values) => void;
  onDelete: () => void;
};

export default function CreateFlashcardSimpleForm({
  values,
  onChange,
  onDelete,
}: Props) {
  return (
    <div className={cn(UiCardClasses, "flex w-96 flex-col px-4 py-2")}>
      <Textarea
        className="h-40 resize-none border-0"
        spellCheck="false"
        placeholder="Question"
        value={values.question}
        onChange={(e) => {
          onChange({
            question: e.target.value,
            answer: values.answer,
          });
        }}
        onKeyDown={(e) => e.stopPropagation()}
      />

      <hr className="mx-auto w-8" />

      <Textarea
        className="h-40 resize-none border-0"
        spellCheck="false"
        placeholder="Answer"
        value={values.answer}
        onChange={(e) => {
          onChange({
            question: values.question,
            answer: e.target.value,
          });
        }}
        onKeyDown={(e) => e.stopPropagation()}
      />

      <Button
        className="mt-2"
        size="icon"
        variant="outline"
        onClick={() => onDelete()}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
}

CreateFlashcardSimpleForm.displayName = "CreateFlashcardSimpleForm";