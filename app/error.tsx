"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="wrap empty">
      <h1>खबरें लोड नहीं हो पाईं।</h1>
      <p>कृपया कुछ देर बाद दोबारा कोशिश करें।</p>
      <button className="button" onClick={reset}>
        फिर कोशिश करें
      </button>
    </main>
  );
}
