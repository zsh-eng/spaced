import { auth } from "@/auth";
import DeckCards from "@/components/decks/deck-cards";
import { PleaseSignIn } from "@/components/please-sign-in";
import db from "@/db";
import { decks } from "@/schema";
import { and, eq } from "drizzle-orm";

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();
  const belongsToUser =
    session?.user?.id &&
    !!(await db.query.decks.findFirst({
      where: and(eq(decks.id, params.id), eq(decks.userId, session.user.id)),
    }));

  if (!belongsToUser) {
    return <PleaseSignIn />;
  }

  return <DeckCards deckId={params.id} />;
}
