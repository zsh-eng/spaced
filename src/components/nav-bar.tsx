"use client";

import Link from "next/link";
import * as React from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/utils/ui";
import { Github, MenuIcon, Telescope, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// TODO This nav menu is a bit of a mess, we should extract the links
// And refactor it

// For mobile navigation
function MenuDrawer() {
  const [open, setOpen] = React.useState(false);
  return (
    <Drawer
      direction="left"
      open={open}
      onOpenChange={(opened) => setOpen(opened)}
    >
      <DrawerTrigger className="md:hidden">
        <MenuIcon className="h-6 w-6" />
      </DrawerTrigger>
      <DrawerContent className="h-full w-60 py-8" direction="left">
        <DrawerClose className="absolute right-4 top-6">
          <XIcon className="h-4 w-4 text-muted-foreground" />
        </DrawerClose>

        <Link href="/" className="flex items-center px-4">
          <Telescope className="mr-2 h-5 w-5" strokeWidth={1.5} />
          <div className="text-md font-semibold">spaced</div>
        </Link>

        <div className="mt-6 flex flex-col gap-y-5 pl-11">
          <div className="flex flex-col gap-y-3">
            <Link href="/" className="text-md" onClick={() => setOpen(false)}>
              Review
            </Link>
          </div>

          <div className="flex flex-col gap-y-3">
            <Link
              href="/decks"
              className="text-md"
              onClick={() => setOpen(false)}
            >
              Decks
            </Link>
          </div>

          <div className="flex flex-col gap-y-3 text-muted-foreground">
            <div className="text-md font-semibold text-primary">Create</div>
            <Link
              href="/decks/create"
              className="text-md"
              onClick={() => setOpen(false)}
            >
              Deck
            </Link>
            <Link
              href="/cards/create"
              className="text-md"
              onClick={() => setOpen(false)}
            >
              Card
            </Link>
            <Link
              href="/cards/create-many"
              className="text-md"
              onClick={() => setOpen(false)}
            >
              Many cards
            </Link>
          </div>

          <div className="flex flex-col gap-y-4">
            <a
              href="https://github.com/zsh-eng/spaced"
              target="_blank"
              onClick={() => setOpen(false)}
            >
              GitHub
            </a>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function NavigationBar() {
  return (
    <NavigationMenu className="col-start-1 col-end-13 h-16 xl:col-start-3 xl:col-end-11">
      <MenuDrawer />

      <NavigationMenuList className="hidden md:flex">
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={"mr-2 flex justify-start"}>
              <Telescope className="h-6 w-6 xs:mr-2" strokeWidth={1.5} />
              <span className="hidden text-lg font-semibold xs:block">
                spaced
              </span>
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Review
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/decks" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Decks
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Create</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-full gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem href="/cards/create" title="Create Flashcard">
                Create a new flashcard with a question and answer.
              </ListItem>
              <ListItem
                href="/cards/create-many"
                title="Bulk Create Flashcards"
              >
                Create many flashcards at once.
              </ListItem>
              <ListItem href="/decks/create" title="Create Deck">
                Create a new deck.
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>

      <Button size="icon" variant="link" asChild>
        <a
          className="ml-auto"
          href="https://github.com/zsh-eng/spaced"
          target="_blank"
        >
          <Github className="h-5 w-5" />
        </a>
      </Button>
      <ThemeToggle />
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
