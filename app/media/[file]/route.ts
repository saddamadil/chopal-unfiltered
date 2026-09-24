import path from "node:path";
import { readFile } from "node:fs/promises";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (!/^[a-f0-9-]{36}(-thumb)?\.webp$/.test(file))
    return new Response(null, { status: 404 });
  try {
    const bytes = await readFile(
      path.join(path.resolve(process.env.UPLOAD_DIR || "uploads"), file),
    );
    return new Response(bytes, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
