"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { labels, statuses, types } from "@/lib/constants";
const RichEditor = dynamic(() => import("./RichEditor"), {
  ssr: false,
  loading: () => <p>संपादक लोड हो रहा है…</p>,
});
export default function ArticleEditor({
  article,
  taxonomy,
  canPublish,
  ownAuthorId,
}: {
  article?: any;
  taxonomy: any;
  canPublish: boolean;
  ownAuthorId?: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<any>({
    title: "",
    slug: "",
    excerpt: "",
    content: "<p></p>",
    categoryId: taxonomy.categories[0]?.id || "",
    subcategoryId: "",
    authorId: ownAuthorId || taxonomy.authors[0]?.id || "",
    stateId: "",
    cityId: "",
    location: "",
    featuredImage: "",
    imageAlt: "",
    imageCaption: "",
    type: "NEWS",
    scheduledAt: "",
    isFeatured: false,
    isTrending: false,
    isBreaking: false,
    isSponsored: false,
    isDemo: false,
    claim: "",
    verdict: "",
    sources: "",
    seoTitle: "",
    seoDescription: "",
    canonicalUrl: "",
    ogImage: "",
    focusKeyword: "",
    schemaType: "NewsArticle",
    robotsIndex: true,
    robotsFollow: true,
    videoUrl: "",
    duration: "",
    tagIds: [],
    ...article,
    status:
      !canPublish && article?.status === "REJECTED"
        ? "DRAFT"
        : article?.status || "DRAFT",
    ...(article
      ? {
          scheduledAt: article.scheduledAt
            ? new Date(
                new Date(article.scheduledAt).getTime() -
                  new Date(article.scheduledAt).getTimezoneOffset() * 60000,
              )
                .toISOString()
                .slice(0, 16)
            : "",
          seoTitle: article.seo?.title || "",
          seoDescription: article.seo?.description || "",
          canonicalUrl: article.seo?.canonicalUrl || "",
          ogImage: article.seo?.ogImage || "",
          focusKeyword: article.seo?.focusKeyword || "",
          schemaType: article.seo?.schemaType || "NewsArticle",
          robotsIndex: article.seo?.robotsIndex ?? true,
          robotsFollow: article.seo?.robotsFollow ?? true,
          videoUrl: article.video?.url || "",
          duration: article.video?.duration || "",
          tagIds: article.tags?.map((t: any) => t.tagId) || [],
        }
      : {}),
  });
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const set = (key: string, value: any) =>
    setData((d: any) => ({ ...d, [key]: value }));
  const field = (
    key: string,
    label: string,
    multiline = false,
    required = false,
  ) => (
    <label key={key}>
      {label}
      {multiline ? (
        <textarea
          value={data[key] || ""}
          onChange={(e) => set(key, e.target.value)}
          rows={key === "excerpt" ? 3 : 4}
          required={required}
        />
      ) : (
        <input
          value={data[key] || ""}
          onChange={(e) => set(key, e.target.value)}
          required={required}
        />
      )}
    </label>
  );
  const select = (
    key: string,
    label: string,
    items: any[],
    optional = false,
  ) => (
    <label>
      {label}
      <select
        value={data[key] || ""}
        onChange={(e) => {
          set(key, e.target.value);
          if (key === "stateId") set("cityId", "");
          if (key === "categoryId") set("subcategoryId", "");
        }}
        required={!optional}
      >
        {optional && <option value="">चुनें</option>}
        {items.map((i) => (
          <option value={i.id} key={i.id}>
            {i.name}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        try {
          const body = {
            ...data,
            scheduledAt: data.scheduledAt
              ? new Date(data.scheduledAt).toISOString()
              : "",
          };
          for (const key of [
            "featuredImage",
            "imageAlt",
            "imageCaption",
            "location",
            "claim",
            "verdict",
            "sources",
          ]) {
            body[key] = String(body[key] ?? "");
          }
          const res = await fetch("/api/admin/articles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const r = await res.json();
          setMessage(r.message || r.error);
          if (res.ok) {
            setData((d: any) => ({
              ...d,
              id: r.article.id,
              version: r.article.version,
            }));
            router.replace(`/admin/articles/${r.article.id}`);
            router.refresh();
          }
        } catch {
          setMessage("कनेक्शन नहीं हो पाया। आपकी सामग्री अभी फ़ॉर्म में है।");
        } finally {
          setBusy(false);
        }
      }}
      className="editor-form"
    >
      <div className="admin-title">
        <div>
          <span className="eyebrow">लेख संपादक</span>
          <h1>{article ? "खबर संपादित करें" : "नई खबर लिखें"}</h1>
        </div>
        <button className="button" disabled={busy}>
          {busy ? "सुरक्षित हो रहा है…" : "बदलाव सुरक्षित करें"}
        </button>
      </div>
      <p className="form-message" role="status">
        {message}
      </p>
      <div className="editor-columns">
        <div className="editor-main">
          <div className="panel form-stack">
            {field("title", "शीर्षक", false, true)}
            {field(
              "slug",
              "URL slug — उदाहरण: ahmedabad-riverfront",
              false,
              true,
            )}
            {field("excerpt", "संक्षिप्त विवरण", true, true)}
            <label>लेख की सामग्री</label>
            <RichEditor
              value={data.content}
              onChange={(html) => set("content", html)}
            />
          </div>
          <details className="panel" open>
            <summary>मुख्य तस्वीर</summary>
            <p className="muted">
              मीडिया लाइब्रेरी में तस्वीर अपलोड करके उसका URL यहाँ जोड़ें।
            </p>
            <a href="/admin/media" target="_blank" rel="noopener">
              मीडिया लाइब्रेरी खोलें ↗
            </a>
            <div className="form-stack">
              {field("featuredImage", "तस्वीर URL")}
              {field("imageAlt", "Alt text — तस्वीर में क्या है?")}
              {field("imageCaption", "चित्र कैप्शन", true)}
            </div>
          </details>
          {data.type === "FACT_CHECK" && (
            <div className="panel form-stack">
              <h2>फैक्ट चेक</h2>
              {field("claim", "दावा", true)}
              {field("verdict", "निष्कर्ष")}
              {field("sources", "स्रोत और जाँच का विवरण", true)}
            </div>
          )}
          {data.type === "VIDEO" && (
            <div className="panel form-stack">
              <h2>वीडियो</h2>
              {field("videoUrl", "YouTube या सीधे वीडियो का URL")}
              {field("duration", "अवधि — उदाहरण: 04:35")}
            </div>
          )}
          <details className="panel">
            <summary>SEO और सोशल शेयरिंग</summary>
            <div className="form-stack">
              {field("seoTitle", "SEO शीर्षक")}
              {field("seoDescription", "SEO विवरण", true)}
              {field("focusKeyword", "मुख्य कीवर्ड")}
              {field("canonicalUrl", "Canonical URL (वैकल्पिक)")}
              {field("ogImage", "Open Graph तस्वीर URL")}
              <label>
                Schema
                <select
                  value={data.schemaType}
                  onChange={(e) => set("schemaType", e.target.value)}
                >
                  {["NewsArticle", "Article", "BlogPosting"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              {["robotsIndex", "robotsFollow"].map((key) => (
                <label className="check-label" key={key}>
                  <input
                    type="checkbox"
                    checked={data[key]}
                    onChange={(e) => set(key, e.target.checked)}
                  />
                  {key}
                </label>
              ))}
            </div>
          </details>
        </div>
        <aside>
          <div className="panel form-stack">
            <h2>प्रकाशन</h2>
            <label>
              स्थिति
              <select
                value={data.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {statuses
                  .filter(
                    (s) =>
                      canPublish || ["DRAFT", "PENDING_REVIEW"].includes(s),
                  )
                  .map((s) => (
                    <option key={s} value={s}>
                      {labels[s]}
                    </option>
                  ))}
              </select>
            </label>
            {data.status === "SCHEDULED" && (
              <label>
                प्रकाशन समय (आपके डिवाइस का समय)
                <input
                  type="datetime-local"
                  value={data.scheduledAt}
                  onChange={(e) => set("scheduledAt", e.target.value)}
                  required
                />
              </label>
            )}
            <label>
              लेख प्रकार
              <select
                value={data.type}
                onChange={(e) => set("type", e.target.value)}
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {labels[t]}
                  </option>
                ))}
              </select>
            </label>
            {select("categoryId", "श्रेणी", taxonomy.categories)}
            {select(
              "subcategoryId",
              "उपश्रेणी",
              taxonomy.subcategories.filter(
                (s: any) => s.categoryId === data.categoryId,
              ),
              true,
            )}
            {select(
              "authorId",
              "लेखक",
              canPublish
                ? taxonomy.authors
                : taxonomy.authors.filter((a: any) => a.id === ownAuthorId),
            )}
            {select("stateId", "राज्य", taxonomy.states, true)}
            {select(
              "cityId",
              "शहर",
              taxonomy.cities.filter((c: any) => c.stateId === data.stateId),
              true,
            )}
            {field("location", "स्थान")}
            <fieldset>
              <legend>टैग</legend>
              {taxonomy.tags.map((t: any) => (
                <label className="check-label" key={t.id}>
                  <input
                    type="checkbox"
                    checked={data.tagIds.includes(t.id)}
                    onChange={(e) =>
                      set(
                        "tagIds",
                        e.target.checked
                          ? [...data.tagIds, t.id]
                          : data.tagIds.filter((id: string) => id !== t.id),
                      )
                    }
                  />
                  {t.name}
                </label>
              ))}
            </fieldset>
            {[
              ["isFeatured", "प्रमुख खबर"],
              ["isTrending", "ट्रेंडिंग"],
              ["isBreaking", "ब्रेकिंग"],
              ["isSponsored", "प्रायोजित सामग्री"],
              ["isDemo", "डेमो लेख"],
            ]
              .filter(
                ([key]) =>
                  canPublish || ["isDemo", "isSponsored"].includes(key),
              )
              .map(([key, label]) => (
                <label className="check-label" key={key}>
                  <input
                    type="checkbox"
                    checked={data[key]}
                    onChange={(e) => set(key, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            <button className="button" disabled={busy}>
              {busy ? "रुकिए…" : "सुरक्षित करें"}
            </button>
          </div>
        </aside>
      </div>
    </form>
  );
}
