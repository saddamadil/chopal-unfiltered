import sanitizeHtml from "sanitize-html";
export function cleanHtml(s: string) {
  return sanitizeHtml(s, {
    allowedTags: [
      "p",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "strong",
      "em",
      "blockquote",
      "a",
      "br",
      "hr",
    ],
    allowedAttributes: { a: ["href", "title", "rel"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}
export function dateLabel(d: Date | string | null | undefined) {
  return d
    ? new Intl.DateTimeFormat("hi-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      }).format(new Date(d))
    : "";
}
export function articleUrl(a: { slug: string; type: string }) {
  const prefix =
    a.type === "OPINION"
      ? "opinion"
      : a.type === "VIDEO"
        ? "video"
        : a.type === "FACT_CHECK"
          ? "fact-check"
          : "news";
  return `/${prefix}/${a.slug}`;
}
export function absolute(path: string) {
  return new URL(
    path,
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ).toString();
}
export function safeUrl(value: string, local = true) {
  if (local && /^\/(?!\/)[\w\-/.?=&%#]+$/.test(value)) return value;
  try {
    const u = new URL(value);
    if (u.protocol === "https:" || u.protocol === "http:") return value;
  } catch {}
  return "";
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
export function xml(s: string) {
  return s.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
}
export function videoEmbed(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be" && /^[\w-]{11}$/.test(u.pathname.slice(1)))
      return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    if (["www.youtube.com", "youtube.com"].includes(u.hostname)) {
      const id = u.searchParams.get("v") || u.pathname.split("/").pop();
      if (id && /^[\w-]{11}$/.test(id))
        return `https://www.youtube-nocookie.com/embed/${id}`;
    }
  } catch {}
  return null;
}
