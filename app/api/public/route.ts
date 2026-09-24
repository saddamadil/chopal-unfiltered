import { readJson } from "@/lib/request";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertOrigin, rateLimit } from "@/lib/auth";
import { publicSchema } from "@/lib/validations";
export async function POST(req: Request) {
  try {
    await assertOrigin();
    if (Number(req.headers.get("content-length") || 0) > 12000)
      return NextResponse.json(
        { error: "संदेश बहुत लंबा है।" },
        { status: 413 },
      );
    await rateLimit("public", 10);
    const result = publicSchema.safeParse(await readJson(req));
    if (!result.success)
      return NextResponse.json(
        { error: "कृपया सभी ज़रूरी विवरण और सहमति भरें।" },
        { status: 400 },
      );
    const d = result.data;
    if (d.kind === "newsletter") {
      await db.subscriber.upsert({
        where: { email: d.email.toLowerCase() },
        create: { email: d.email.toLowerCase() },
        update: {},
      });
      return NextResponse.json({
        message:
          "आपकी सदस्यता रुचि दर्ज हो गई है। ईमेल वितरण शुरू होने पर समाचार पत्र भेजा जाएगा।",
      });
    }
    if (!d.name || !d.message || d.message.length < 10)
      return NextResponse.json(
        { error: "नाम और कम से कम 10 अक्षरों का संदेश लिखें।" },
        { status: 400 },
      );
    if (d.kind === "comment") {
      const article = await db.article.findFirst({
        where: {
          id: d.articleId || "",
          status: "PUBLISHED",
          publishedAt: { lte: new Date() },
        },
      });
      if (!article)
        return NextResponse.json({ error: "लेख नहीं मिला।" }, { status: 404 });
      await db.comment.create({
        data: {
          articleId: article.id,
          name: d.name,
          email: d.email,
          content: d.message,
        },
      });
    } else
      await db.contactMessage.create({
        data: {
          name: d.name,
          email: d.email,
          subject: d.subject || "पाठक संदेश",
          message: d.message,
        },
      });
    return NextResponse.json({
      message:
        d.kind === "comment"
          ? "आपकी टिप्पणी समीक्षा के लिए भेज दी गई है।"
          : "आपका संदेश संपादकीय टीम तक पहुँच गया है।",
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error && /^(बहुत अधिक|यह केवल|अनुरोध का)/.test(e.message)
            ? e.message
            : "कृपया दोबारा कोशिश करें।",
      },
      { status: 400 },
    );
  }
}
