import { auth } from "@/auth";
import Deckbox from "@/components/decks/deck-box";
import { PleaseSignIn } from "@/components/please-sign-in";

export default async function DecksPage() {
  const session = await auth();
  if (!session) {
    return <PleaseSignIn />;
  }

  return <Deckbox />;
}
