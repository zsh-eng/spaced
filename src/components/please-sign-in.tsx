"use client";

import { Button } from "@/components/ui/button";
import { SiGithub, SiGoogle } from "@icons-pack/react-simple-icons";
import { Loader2, Telescope } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function PleaseSignIn() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  return (
    <div className="relative col-span-12 flex h-full items-center justify-center gap-16 pb-24">
      <div className="hidden md:block md:w-16 lg:w-32"></div>
      <div className="relative hidden flex-col justify-self-end md:flex">
        <Telescope
          className="absolute -top-40 right-0 -z-10 h-96 w-96 text-muted/20"
          strokeWidth={1.5}
        />
        <div className="text-3xl font-bold">spaced</div>
        <div className="text-lg text-muted-foreground">
          A better way to learn.
        </div>
      </div>

      <Telescope
        className="absolute right-0 top-40 -z-10 h-[600px] w-[600px] text-muted/20 md:hidden"
        strokeWidth={1.5}
      />
      <div className="flex h-96 w-full flex-col items-stretch justify-center gap-2 justify-self-start md:w-80">
        <div className="mb-2 flex flex-col">
          <p className="text-2xl font-bold">Welcome back</p>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            setGoogleLoading(true);
            signIn("google");
          }}
        >
          {googleLoading ? (
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          ) : (
            <SiGoogle className="mr-3 h-5 w-5" />
          )}
          Sign in with Google
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            setGithubLoading(true);
            signIn("github");
          }}
        >
          {githubLoading ? (
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          ) : (
            <SiGithub className="mr-3 h-5 w-5" />
          )}
          Sign in with GitHub
        </Button>
      </div>
    </div>
  );
}

PleaseSignIn.displayName = "PleaseSignIn";
