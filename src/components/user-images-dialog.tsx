import React, { useState, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { ImageIcon } from "lucide-react";

export default function UserImagesDialog() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: images = [] } = trpc.image.list.useQuery();
  const firstTwentyImages = images.slice(0, 20);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "i") {
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleImageClick = (image: any) => {
    navigator.clipboard.writeText(`![${image.description}](${image.url})`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size={"icon"}>
          <ImageIcon className="h-4 w-4" />
        </Button>
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
          <ScrollArea className="h-[300px] overflow-y-auto mt-2">
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
