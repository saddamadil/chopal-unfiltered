import { Search } from "lucide-react";
import { listStories } from "@/lib/content";
import { NewsCard, Pagination } from "@/components/News";
export const metadata = {
  title: "खबर खोजें",
  robots: { index: false, follow: true },
};
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const p = await searchParams;
  const q = (p.q || "").slice(0, 150);
  const result = q ? await listStories({ q, page: Number(p.page) || 1 }) : null;
  return (
    <main id="main" className="wrap listing">
      <span className="eyebrow">खबरों की खोज</span>
      <h1>आप क्या जानना चाहते हैं?</h1>
      <form action="/search" className="search-form">
        <label className="sr-only" htmlFor="q">
          खोज शब्द
        </label>
        <Search />
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="खबर, शहर, लेखक या विषय खोजें…"
          maxLength={150}
          required
        />
        <button className="button">खोजें</button>
      </form>
      {result && (
        <>
          <p className="results-count">
            “{q}” के लिए {result.total} नतीजे
          </p>
          <div className="three-grid">
            {result.items.map((a) => (
              <NewsCard key={a.id} story={a} />
            ))}
          </div>
          {!result.items.length && (
            <div className="empty">
              कोई खबर नहीं मिली। दूसरे शब्दों से खोजकर देखें।
            </div>
          )}
          <Pagination {...result} base="/search" q={q} />
        </>
      )}
    </main>
  );
}
