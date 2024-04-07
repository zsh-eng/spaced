import { createEmptyCard, FSRS, Rating, type ReviewLog } from 'ts-fsrs';

// Schema

// TODO add user and auth

// See https://open-spaced-repetition.github.io/ts-fsrs/

// TODO Maybe store the parameters for users to customise it the way they want.
// Parameters

// TODO ReviewLog - handle

// TODO Card

// TODO CardContent - content associated with a card
// question, answer
// source, sourceId, deleted

// enum Rating - rating to be given to a card

// enum State - the current state of a card, which can be New, Learning, Review, Relearning
// This is similar to what exists for Anki

let card = createEmptyCard();
const f = new FSRS({});

let schedulingCards = f.repeat(card, new Date());

for (let i = 0; i < 10; i++) {
  console.log(card.due);
  card = schedulingCards[Rating.Good].card;
  schedulingCards = f.repeat(card, card.due);
}
