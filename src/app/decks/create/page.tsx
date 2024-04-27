import { CreateDeckForm } from "@/components/decks/create-deck-form";
import { auth } from "@/auth";
import { PleaseSignIn } from "@/components/please-sign-in";

export default async function CreateDeckPage() {
  const session = await auth();
  if (!session) {
    return <PleaseSignIn />;
  }

  return <CreateDeckForm />;
}
