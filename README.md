# Spaced

Spaced is a modern flashcard app that helps you learn faster and remember longer.
It uses spaced repetition to help you learn more efficiently.

## Acknowledgements

Libraries I've referenced in this project:

- [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs)
- [ts-fsrs-demo](https://github.com/ishiko732/ts-fsrs-demo)

## Scheduling Cards

This section explains how to schedule cards, because I had some trouble understanding the `ts-fsrs` library at first.

1. Create a new card using `createEmptyCard()`.
2. Create a new FSRS object using `new FSRS(params)`.
3. Get the possible next cards (a `RecordLog`) by using `f.repeat(card, date)`
   where the date is the current date or the date you want the card to be scheduled.
4. Get the next card you want by indexing the `RecordLog` with the appropriate
   `Rating` e.g. `recordLog[Rating.Good]`.

## `ts-fsrs-demo` Example

This section explains how the `ts-fsrs-demo` example works.
This is for my own learning, and to help me understand how to implement my own SRS app.

### Notebox

A "notebox" is a collection of Note+Card to be learned for that day.

- For new cards being learnt, fetch the limit set in the params.
- For review cards, fetch the cards that are due for review (i.e. review date is lte now).
- Return this entire collection to the client.

Notes:

- This can just be an API endpoint that returns the notebox for the day.
- The approach might work if there are not too many cards to be reviewed.
  To do more testing on this - as I used to have decks with 1000+ cards to be reviewed. It's unnecessary to fetch all of them at once.
  However, for an initial prototype, this is fine.

In fact, is it even necessary to calculate the next few cards each time we get the cards from the notebox?
Why not just calculate the next card when the user rates the card - handled at the server side,
while the client side just continues to show the next cards to review.

The only issue that we might face is learning / relearning - that has to be shown on the client side.

One approach to explore is to send the card to the server - either return 'OK' if the card only has
to be reviewed > 24 hours later, or return when the card is next to be reviewed.
In that case the computation of the next card is all done on the server side.

### CardsClient

Provides the notebox through the context.

Context provider is `CardProvider`.
CardProvider has hooks which manage the notebox.
`State.Learning` and `State.Relearning` cards are combined into a single array.

CardProvider provides an API to do certain tasks.
E.g.

`handleSchdule`
Schedules a card by calling the `fsrs` PUT endpoint.

`handleChange`
Handles the updated card after giving the card a Rating / Grade.

The `notebox[currentType]` is sliced to remove the latest card.

If the card went from Learning -> Learning / Re-learning,
we append it to the end of the `notebox[State.Learning]`.

If the card went from New / Review -> Learning / Re-learning,
we remove it from `notebox[currentType]` and append it to the end of `notebox[State.Learning]`.

If the card went from ? -> Review,
we remove it from the `notebox[currentType]`.
There's no need to do anything else as the card won't be seen again for today.

The `ref` for handling rollbacks is also updated.

Notes:

- We can use zustand to handle the state management on client side.

`updateStateBox`

Handles changes to the state.

If current type is New, then we prioritise next card to be Learning, Review, New - in that order (depending on whetehr these cards are available).

If current type is Learning, then we prioritise the next card to Review, New, Learning.

If current type is Review, then we prioritise the next card to be Learning, New, Review.

If the type to change to is Learning, but the card is not due to be learnt, then we randomly choose between Review and New.
