import { readJson } from "@/lib/request";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertOrigin, rateLimit } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    await assertOrigin();
    await rateLimit("views", 120, 60 * 1000);
    const { id } = await readJson(req);
    if (typeof id !== "string" || id.length > 100)
      return new Response(null, { status: 400 });
    // View counters must not change editorial modification timestamps.
    await db.$executeRaw`UPDATE Article SET views = views + 1 WHERE id = ${id} AND status = 'PUBLISHED' AND publishedAt <= ${new Date()}`;
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Unavailable" }, { status: 400 });
  }
}
