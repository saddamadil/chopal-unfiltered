"use client";
import { useState } from "react";
export default function PublicForm({
  kind,
  articleId,
  demo = false,
}: {
  kind: "newsletter" | "comment" | "contact";
  articleId?: string;
  demo?: boolean;
}) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      className={`public-form ${kind === "newsletter" ? "newsletter-form" : "form-stack"}`}
      onSubmit={async (e) => {
        e.preventDefault();
        const f = e.currentTarget;
        setBusy(true);
        setMessage("");
        try {
          const res = await fetch("/api/public", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...Object.fromEntries(new FormData(f)),
              kind,
              articleId,
            }),
          });
          const data = await res.json();
          setMessage(data.message || data.error);
          if (res.ok) f.reset();
        } catch {
          setMessage("कनेक्शन नहीं हो पाया। कृपया दोबारा कोशिश करें।");
        } finally {
          setBusy(false);
        }
      }}
    >
      {kind !== "newsletter" && (
        <label>
          आपका नाम
          <input name="name" required maxLength={100} />
        </label>
      )}
      <label className={kind === "newsletter" ? "email-field" : ""}>
        {kind === "newsletter" ? (
          <span className="sr-only">ईमेल पता</span>
        ) : (
          "ईमेल"
        )}
        <input
          name="email"
          type="email"
          required
          placeholder="आपका ईमेल पता"
          maxLength={191}
        />
      </label>
      {kind === "contact" && (
        <label>
          विषय
          <input name="subject" required maxLength={191} />
        </label>
      )}
      {kind !== "newsletter" && (
        <label>
          {kind === "comment" ? "आपकी टिप्पणी" : "संदेश"}
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={5000}
            rows={5}
          />
        </label>
      )}
      <input
        className="honeypot"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <button className="button" disabled={busy || demo}>
        {busy
          ? "भेज रहे हैं…"
          : kind === "newsletter"
            ? "मुझे जोड़ें →"
            : kind === "comment"
              ? "टिप्पणी भेजें"
              : "संदेश भेजें"}
      </button>
      <label className="consent">
        <input type="checkbox" name="consent" value="yes" required />
        मैं <a href="/privacy">गोपनीयता नीति</a> से सहमत हूँ।
      </label>
      {demo && (
        <p className="muted">
          डेमो में फ़ॉर्म बंद हैं। लाइव वेबसाइट पर अपनी बात भेज सकेंगे।
        </p>
      )}
      <p role="status" className="form-message">
        {message}
      </p>
    </form>
  );
}
