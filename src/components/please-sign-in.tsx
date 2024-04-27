import { Telescope } from "lucide-react";

export function PleaseSignIn() {
  return (
    <div className="col-span-12 flex h-2/3 flex-col items-center justify-center">
      <Telescope className="h-24 w-24" strokeWidth={1.5} />
      <div className="text-muted-foreground">Please sign in to continue.</div>
    </div>
  );
}

PleaseSignIn.displayName = "PleaseSignIn";
