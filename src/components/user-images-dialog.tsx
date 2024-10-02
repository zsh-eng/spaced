import { buttonVariants } from "@/components/ui/button";
import { Command } from "@/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { trpc } from "@/utils/trpc";
import { cn } from "@/utils/ui";
import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserImagesDialog() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: images = [] } = trpc.image.list.useQuery();
  const firstTwentyImages = images.slice(0, 20);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "i") {
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleImageClick = (image: any) => {
    navigator.clipboard.writeText(`![${image.description}](${image.url})`);
    toast.success("Copied to clipboard!", { duration: 1000 });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "icon",
                }),
              )}
              onClick={() => setOpen(true)}
            >
              <ImageIcon className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col items-center">
                <p>View images</p>
                <Kbd className="mr-auto">Ctrl+I</Kbd>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Search Images</DialogTitle>
          <DialogDescription>
            Search and select an image to insert into your flashcard.
          </DialogDescription>
        </DialogHeader>
        <Command className="rounded-lg border shadow-md">
          <Input
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none"
          />
          <ScrollArea className="mt-2 h-[300px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 p-2">
              {firstTwentyImages.map((image, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  src={image.url}
                  //   alt={image.description}
                  alt={"test"}
                  className="h-auto w-full cursor-pointer rounded object-cover"
                  onClick={() => handleImageClick(image)}
                />
              ))}
            </div>
          </ScrollArea>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
