import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canPublish } from "@/lib/permissions";
import { labels, statuses, types } from "@/lib/constants";
import DeleteArticle from "@/components/DeleteArticle";
export default async function Articles({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    type?: string;
    page?: string;
  }>;
}) {
  const u = await requireUser();
  const p = await searchParams;
  const page = Math.max(1, Number(p.page) || 1);
  const where: any = {
    ...(!canPublish(u.role) ? { creatorId: u.id } : {}),
    ...(p.q ? { title: { contains: p.q.slice(0, 150) } } : {}),
    ...(statuses.includes(p.status as any) ? { status: p.status } : {}),
    ...(types.includes(p.type as any) ? { type: p.type } : {}),
  };
  const [items, total] = await Promise.all([
    db.article.findMany({
      where,
      include: { author: true, category: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
      skip: (page - 1) * 20,
    }),
    db.article.count({ where }),
  ]);
  const url = (n: number) =>
    "/admin/articles?" + new URLSearchParams({ ...p, page: String(n) });
  return (
    <>
      <div className="admin-title">
        <h1>
          सभी लेख <small>({total})</small>
        </h1>
        <Link className="button" href="/admin/articles/new">
          ＋ नया लेख
        </Link>
      </div>
      <form className="admin-filter">
        <input name="q" placeholder="शीर्षक खोजें" defaultValue={p.q} />
        <select name="status" defaultValue={p.status || ""}>
          <option value="">सभी स्थितियाँ</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {labels[s]}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={p.type || ""}>
          <option value="">सभी प्रकार</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {labels[t]}
            </option>
          ))}
        </select>
        <button className="button">खोजें</button>
      </form>
      <div className="panel table-scroll">
        <table>
          <thead>
            <tr>
              <th>शीर्षक</th>
              <th>श्रेणी</th>
              <th>लेखक</th>
              <th>स्थिति</th>
              <th>कार्रवाई</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link href={`/admin/articles/${a.id}`}>{a.title}</Link>
                  {a.isDemo && <small>डेमो</small>}
                </td>
                <td>{a.category.name}</td>
                <td>{a.author.name}</td>
                <td>
                  <span className={`status status-${a.status}`}>
                    {labels[a.status]}
                  </span>
                </td>
                <td>
                  <Link href={`/admin/articles/${a.id}`}>संपादित करें</Link>
                  {canPublish(u.role) && <DeleteArticle id={a.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <div className="empty">कोई लेख नहीं मिला।</div>}
      </div>
      <nav className="pagination">
        {page > 1 && <Link href={url(page - 1)}>← पिछला</Link>}
        <span>पृष्ठ {page}</span>
        {page * 20 < total && <Link href={url(page + 1)}>अगला →</Link>}
      </nav>
    </>
  );
}
