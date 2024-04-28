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
import { SiGithub } from "@icons-pack/react-simple-icons";
import { MenuIcon, Telescope, XIcon } from "lucide-react";
import { useSession } from "next-auth/react";

function MobileMenuDrawer() {
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

export function NavigationBar() {
  const session = useSession();

  return (
    <NavigationMenu className="col-start-1 col-end-13 h-16 px-4 xl:col-start-3 xl:col-end-11">
      <MobileMenuDrawer />

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
            <SiGithub className="h-5 w-5" />
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
