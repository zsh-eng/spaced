import { FormMarkdownEditor } from "@/components/form/form-markdown-editor";
import { Form } from "@/components/ui/form";
import { CardContentFormValues } from "@/form";
import { cn } from "@/utils/ui";
import { Telescope } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

type Props = {
  form: UseFormReturn<CardContentFormValues>;

  setOpen: (opened: boolean) => void;
  open: boolean;

  editing: boolean;
};

export function EditableFlashcard({ form, setOpen, open, editing }: Props) {
  const onContainerFocus = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const milkdown = target.querySelector(".ProseMirror") as HTMLDivElement;
    if (milkdown) milkdown.focus();
  };

  const editorContainerClasses = cn(
    "col-span-8 flex h-full min-h-80 w-full items-center justify-center overflow-y-auto rounded-md border border-input transition duration-300 sm:col-span-4 sm:min-h-96",
    editing ? "bg-muted/70" : "",
  );

  return (
    <Form {...form}>
      <div className={cn(editorContainerClasses)} onClick={onContainerFocus}>
        <FormMarkdownEditor name="question" form={form} disabled={!editing} />
      </div>

      <div
        className={cn(editorContainerClasses, "relative")}
        onClick={onContainerFocus}
      >
        <div
          className={cn(
            "absolute -bottom-0 z-10 h-full w-full cursor-pointer bg-muted transition hover:bg-muted/80",
            open ? "-z-10 opacity-0" : "",
          )}
          onClick={() => setOpen(true)}
        >
          <div className="flex h-full w-full items-center justify-center text-background">
            <Telescope className="h-16 w-16" strokeWidth={1} />
          </div>
        </div>
        <FormMarkdownEditor
          className={cn(!open ? "opacity-0" : "")}
          name="answer"
          form={form}
          disabled={!editing}
        />
      </div>
    </Form>
  );
}

EditableFlashcard.displayName = "EditableFlashcard";
