import { Card, CardContent } from "@/schema";
import { produce } from "immer";

/**
 * A card in the session
 */
export type SessionCard = {
  cards: Card;
  card_contents: CardContent;
};

/**
 * The statistics for the outstanding cards
 * in a session.
 */
export type SessionStats = {
  new: number;
  learning: number;
  review: number;
  total: number;
};

/**
 * The data structure for the cards in a session,
 * i.e. the cards that are to be reviewed.
 */
export type SessionData = {
  newCards: SessionCard[];
  reviewCards: SessionCard[];
  stats: SessionStats;
};

/**
 * Computes the next session data after grading a card.
 *
 * Preconditions: The card is in the session data.
 * If the card's state is `New`, then the card exists in `newCards`.
 * If the card is any oher state, then the card exists in `reviewCards`.
 *
 * @param data The current session data
 * @param cardId The id of the card that was graded
 */
export function removeCardFromSessionData(
  data: SessionData,
  cardId: string,
): SessionData {
  // In this implementation, we only show cards that are past the due date.
  // As such, we can assume that we won't see the card again in the current deck.
  const card = getSessionCard(data, cardId);
  if (!card) {
    throw new Error(`Card with id ${cardId} not found in session data`);
  }

  const nextData = produce(data, (draft) => {
    if (card.cards.state === "New") {
      draft.newCards = draft.newCards.filter(
        (c) => c.cards.id !== card.cards.id,
      );
    } else {
      draft.reviewCards = draft.reviewCards.filter(
        (c) => c.cards.id !== card.cards.id,
      );
    }

    switch (card.cards.state) {
      case "New":
        draft.stats.new--;
        break;
      case "Learning":
      case "Relearning":
        draft.stats.learning--;
        break;
      case "Review":
        draft.stats.review--;
        break;
    }
    draft.stats.total--;
  });

  return nextData;
}

function addCardToSessionData(
  data: SessionData,
  card: SessionCard,
): SessionData {
  const nextData = produce(data, (draft) => {
    if (card.cards.state === "New") {
      draft.newCards.push(card);
    } else {
      draft.reviewCards.push(card);
    }

    switch (card.cards.state) {
      case "New":
        draft.stats.new++;
        break;
      case "Learning":
      case "Relearning":
        draft.stats.learning++;
        break;
      case "Review":
        draft.stats.review++;
        break;
    }
    draft.stats.total++;
  });

  return nextData;
}

export function updateCardInSessionData(
  data: SessionData,
  card: SessionCard,
): SessionData {
  const filteredData = removeCardFromSessionData(data, card.cards.id);
  return addCardToSessionData(filteredData, card);
}

/**
 * Gets the card from the session data.
 */
export function getSessionCard(
  sessionData: SessionData,
  cardId: string,
): SessionCard | undefined {
  return (
    sessionData.newCards.find((c) => c.cards.id === cardId) ??
    sessionData.reviewCards.find((c) => c.cards.id === cardId)
  );
}

export function getSessionCardWithContentId(
  sessionData: SessionData,
  cardContentId: string,
): SessionCard | undefined {
  return (
    sessionData.newCards.find((c) => c.card_contents.id === cardContentId) ??
    sessionData.reviewCards.find((c) => c.card_contents.id === cardContentId)
  );
}
