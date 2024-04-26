import CardCountBadge from "@/components/flashcard/main/card-count-badge";
import FlashcardState from "@/components/flashcard/flashcard-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SessionCard, SessionStats } from "@/utils/session";
import { cn } from "@/utils/ui";
import _ from "lodash";
import {
  ChevronsRight,
  FilePenIcon,
  Info,
  Plus,
  TrashIcon,
  Undo,
} from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import CreateFlashcardForm from "@/components/flashcard/create-flashcard-form";
import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { format, intlFormatDistance } from "date-fns";

type Props = {
  card: SessionCard;
  stats: SessionStats;
  onSkip: () => void;
  onDelete: () => void;
  onUndo: () => void;
  handleEdit: () => void;
  editing: boolean;
  setEditing: (editing: boolean) => void;
};

export function FlashcardMenuBar({
  card: sessionCard,
  stats,
  handleEdit,
  editing,
  setEditing,

  onSkip,
  onDelete,
  onUndo,
}: Props) {
  const [cardFormOpen, setCardFormOpen] = useState(false);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "ArrowRight") {
        onSkip();
      }
      if (e.shiftKey && e.key === "I") {
        setEditing(!editing);
      }
      if (e.shiftKey && e.key === "D") {
        onDelete();
      }
      if (e.shiftKey && e.key === "N") {
        setCardFormOpen(true);
      }
    };

    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  });

  return (
    <div className="col-span-8 flex h-24 flex-wrap items-end justify-center gap-x-2">
      {/* Stats and review information */}
      <CardCountBadge stats={stats} />
      {
        <FlashcardState
          state={sessionCard.cards.state}
          className="hidden rounded-sm md:flex"
        />
      }

      {/* Separator */}
      <div className="mr-auto w-screen sm:w-0"></div>

      {/* Icons */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-text" onClick={onUndo}>
            <Button variant="ghost" size="icon">
              <Undo className="h-6 w-6" strokeWidth={1.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex flex-col items-center">
            <p>Undo</p>
            <Kbd>Ctrl+Z</Kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-text" onClick={onSkip}>
            <Button variant="ghost" size="icon">
              <ChevronsRight className="h-6 w-6" strokeWidth={1.5} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex flex-col items-center">
            <p>Suspend</p>
            <Kbd className="mx-auto">Shift+→</Kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="cursor-text">
            <Toggle
              aria-label="toggle edit"
              pressed={editing}
              onPressedChange={(isEditing) => {
                if (!isEditing) {
                  handleEdit();
                }

                setEditing(isEditing);
              }}
            >
              <FilePenIcon className="h-4 w-4" strokeWidth={1.5} />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent className="flex flex-col items-center">
            <p>Edit</p>
            <Kbd className="mx-auto">Shift+I</Kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Drawer direction="right">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-text">
              <DrawerTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                )}
              >
                <Info className="h-4 w-4" />
              </DrawerTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show card info</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DrawerContent className="h-full" direction="right">
          <DrawerHeader>
            <DrawerTitle>Card Info</DrawerTitle>
          </DrawerHeader>
          <DialogDescription className="px-4">
            {sessionCard &&
              Object.entries(sessionCard.cards).map(([k, v]) => {
                return (
                  <div key={k}>
                    {_.upperFirst(k)}:{" "}
                    {v instanceof Date
                      ? format(v, "yyyy-MM-dd HH:mm:ss")
                      : v?.toString()}
                  </div>
                );
              })}
          </DialogDescription>
        </DrawerContent>
      </Drawer>

      <Dialog open={cardFormOpen} onOpenChange={setCardFormOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-text">
              <DialogTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                )}
              >
                <Plus className="h-4 w-4" />
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent className="flex flex-col items-center">
              <p>New card</p>
              <Kbd className="mx-auto">Shift+N</Kbd>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create</DialogTitle>
            <DialogDescription>
              Fill in the front and back to your flashcard.
            </DialogDescription>
          </DialogHeader>
          <CreateFlashcardForm />
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="cursor-text">
              <AlertDialogTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                )}
              >
                <TrashIcon className="h-4 w-4" strokeWidth={1.5} />
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent className="flex flex-col items-center">
              <p>Delete card</p>
              <Kbd className="mx-auto">Shift+D</Kbd>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this card?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

FlashcardMenuBar.displayName = "FlashcardMenuBar";
