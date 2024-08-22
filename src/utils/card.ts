import { MAX_DATE } from "@/common";
import { Card } from "@/schema";

export function isCardPermanentlySuspended(card: Pick<Card, "suspended">) {
    return card.suspended.getTime() >= MAX_DATE.getTime();
}