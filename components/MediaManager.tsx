"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function MediaManager({
  items,
  canDelete,
}: {
  items: any[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [edit, setEdit] = useState<any>(null);
  return (
    <>
      <div className="admin-title">
        <h1>मीडिया लाइब्रेरी</h1>
      </div>
      <form
        className="panel form-grid"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = e.currentTarget;
          setBusy(true);
          try {
            const res = await fetch("/api/admin/media", {
              method: "POST",
              body: new FormData(f),
            });
            const d = await res.json();
            setMessage(d.error || "तस्वीर अपलोड हो गई। नीचे से URL कॉपी करें।");
            if (res.ok) {
              f.reset();
              router.refresh();
            }
          } catch {
            setMessage("अपलोड नहीं हो सका।");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          तस्वीर (JPG, PNG, WebP · 5 MB)
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp"
            required
          />
        </label>
        <label>
          Alt text
          <input name="alt" required minLength={5} maxLength={250} />
        </label>
        <label>
          कैप्शन
          <input name="caption" maxLength={2000} />
        </label>
        <button className="button" disabled={busy}>
          {busy ? "अपलोड हो रहा है…" : "अपलोड करें"}
        </button>
      </form>
      <p role="status">{message}</p>
      <label>
        तस्वीर खोजें
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Alt text या कैप्शन"
        />
      </label>
      {edit && (
        <form
          className="panel form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await fetch("/api/admin/media", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(edit),
            });
            const r = await res.json();
            setMessage(r.error || "विवरण अपडेट हो गया।");
            if (res.ok) {
              setEdit(null);
              router.refresh();
            }
          }}
        >
          <label>
            Alt text
            <input
              value={edit.alt}
              onChange={(e) => setEdit({ ...edit, alt: e.target.value })}
            />
          </label>
          <label>
            कैप्शन
            <input
              value={edit.caption || ""}
              onChange={(e) => setEdit({ ...edit, caption: e.target.value })}
            />
          </label>
          <div className="button-row">
            <button className="button">सुरक्षित करें</button>
            <button type="button" onClick={() => setEdit(null)}>
              रद्द करें
            </button>
          </div>
        </form>
      )}
      <div className="media-grid">
        {items
          .filter((m) => `${m.alt} ${m.caption}`.includes(q))
          .map((m) => (
            <article className="panel" key={m.id}>
              <img src={m.thumbnail} alt={m.alt} />
              <p>{m.alt}</p>
              <small>
                {m.width} × {m.height} · {Math.round(m.size / 1024)} KB
              </small>
              <input
                aria-label="तस्वीर URL"
                value={m.url}
                readOnly
                onFocus={(e) => e.target.select()}
              />
              <div className="button-row">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(m.url);
                      setMessage("URL कॉपी हो गया।");
                    } catch {
                      setMessage("ऊपर का URL चुनकर कॉपी करें।");
                    }
                  }}
                >
                  URL कॉपी
                </button>
                <button onClick={() => setEdit(m)}>विवरण</button>
                {canDelete && (
                  <button
                    className="danger-link"
                    onClick={async () => {
                      if (!confirm("तस्वीर हटाएँ?")) return;
                      const res = await fetch("/api/admin/media", {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: m.id }),
                      });
                      const d = await res.json();
                      setMessage(d.error || "तस्वीर हट गई।");
                      if (res.ok) router.refresh();
                    }}
                  >
                    हटाएँ
                  </button>
                )}
              </div>
            </article>
          ))}
      </div>
    </>
  );
}
