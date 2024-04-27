"use client";

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { signIn } from "next-auth/react";

export function SignIn() {
  return (
    <Button variant="outline" onClick={() => signIn("github")}>
      <Github className="mr-2 h-4 w-4" />
      Sign in
    </Button>
  );
}