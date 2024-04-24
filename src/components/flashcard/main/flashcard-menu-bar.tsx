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
          <TooltipContent>
            <p>Skip card and show in 10 minutes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

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

      <Dialog>
        <DialogTrigger
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <Info className="h-4 w-4" />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stats</DialogTitle>
            {sessionCard &&
              Object.entries(sessionCard.cards).map(([k, v]) => {
                return (
                  <DialogDescription key={k}>
                    {_.upperFirst(k)}: {v?.toString()}
                  </DialogDescription>
                );
              })}
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <Plus className="h-4 w-4" />
        </DialogTrigger>
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
        <AlertDialogTrigger
          className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
        >
          <TrashIcon className="h-4 w-4" strokeWidth={1.5} />
        </AlertDialogTrigger>
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
