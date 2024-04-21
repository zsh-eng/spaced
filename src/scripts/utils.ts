import db from "@/db";
import { cardContents, cards, decks, reviewLogs } from "@/schema";
import { success } from "@/utils/format";

export async function wipeDatabase() {
  console.log("Deleting all data from the database");
  await db.delete(reviewLogs).all();
  await db.delete(cardContents).all();
  await db.delete(cards).all();
  await db.delete(decks).all();
  console.log(success`Deleted all data from the database`);
}
