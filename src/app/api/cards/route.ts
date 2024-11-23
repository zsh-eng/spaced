import db from '@/db';

export async function GET() {
  const cards = await db.query.cards.findMany();

  return Response.json({
    data: cards,
  });
}

export async function PUT() {}

export const runtime = "edge";