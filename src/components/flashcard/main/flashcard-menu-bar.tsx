import CreateFlashcardForm from "@/components/flashcard/create-flashcard-form";
import FlashcardState from "@/components/flashcard/flashcard-state";
import CardCountBadge from "@/components/flashcard/main/card-count-badge";
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
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Kbd } from "@/components/ui/kbd";
import { Toggle } from "@/components/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHistory } from "@/providers/history";
import { SessionCard, SessionStats } from "@/utils/session";
import { cn } from "@/utils/ui";
import { format } from "date-fns";
import _ from "lodash";
import {
  ChevronsRight,
  FilePenIcon,
  Info,
  Plus,
  TrashIcon,
  Undo,
} from "lucide-react";
import { useEffect, useState } from "react";

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
  const { isUndoing } = useHistory();
  const disabled = isUndoing;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (disabled) {
        return;
      }
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
  }, [disabled, onSkip, onDelete, setCardFormOpen, editing, setEditing]);

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

      {/* Undo Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            onClick={onUndo}
            className={cn(
              buttonVariants({
                variant: "ghost",
                size: "icon",
              }),
            )}
            disabled={disabled}
          >
            <Undo className="h-6 w-6" strokeWidth={1.5} />
          </TooltipTrigger>
          <TooltipContent className="flex flex-col items-center">
            <p>Undo</p>
            <Kbd>Ctrl+Z</Kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Suspend Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            onClick={onSkip}
            className={cn(
              buttonVariants({
                variant: "ghost",
                size: "icon",
              }),
            )}
            disabled={disabled}
          >
            <ChevronsRight className="h-6 w-6" strokeWidth={1.5} />
          </TooltipTrigger>
          <TooltipContent className="flex flex-col items-center">
            <p>Suspend</p>
            <Kbd className="mx-auto">Shift+→</Kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              aria-label="toggle edit"
              disabled={disabled}
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

      {/* Info Button */}
      <Drawer direction="right">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DrawerTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                )}
                disabled={disabled}
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

      {/* New Card Button */}
      <Dialog open={cardFormOpen} onOpenChange={setCardFormOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                )}
                disabled={disabled}
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

      {/* Delete Button */}
      <AlertDialog>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon" }),
                )}
                disabled={disabled}
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
