import Link from "next/link";
import * as React from "react";

import { ProfileButton } from "@/components/profile-button";
import { SignIn } from "@/components/sign-in";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  NavigationMenu,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/utils/ui";
import { Github, MenuIcon, Telescope, XIcon } from "lucide-react";
import { useSession } from "next-auth/react";

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
              href="/cards/create-many"
              className="text-md"
              onClick={() => setOpen(false)}
            >
              Many cards
            </Link>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
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

export function NavigationBar() {
  const session = useSession();

  return (
    <NavigationMenu className="col-start-1 col-end-13 h-16 px-4 md:px-6 xl:col-start-3 xl:col-end-11">
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
          <Link href="/decks/create" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              New Deck
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/cards/create-many" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Bulk Create
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>

      <div className="ml-auto flex items-center gap-2">
        <Button size="icon" variant="link" asChild>
          <a href="https://github.com/zsh-eng/spaced" target="_blank">
            <Github className="h-5 w-5" />
          </a>
        </Button>
        <ThemeToggle />
        {session.data ? (
          <ProfileButton user={session?.data?.user} />
        ) : (
          <SignIn />
        )}
      </div>
    </NavigationMenu>
  );
}

NavigationBar.displayName = "NavigationBar";
