import DeckCards from "@/components/decks/deck-cards";

export default function Page({ params }: { params: { id: string } }) {
  return <DeckCards deckId={params.id} />;
}
