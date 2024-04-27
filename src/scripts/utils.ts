import db from "@/db";
import {
  accounts,
  cardContents,
  cards,
  cardsToDecks,
  decks,
  reviewLogs,
  sessions,
  users,
} from "@/schema";
import { success } from "@/utils/format";

export async function wipeDatabase() {
  console.log("Deleting all data from the database");
  await db.delete(reviewLogs).all();
  await db.delete(cardContents).all();
  await db.delete(cards).all();
  await db.delete(decks).all();
  await db.delete(cardsToDecks).all();
  await db.delete(users).all();
  await db.delete(sessions).all();
  await db.delete(accounts).all();
  console.log(success`Deleted all data from the database`);
}
