import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canPublish } from "@/lib/permissions";
import { labels } from "@/lib/constants";
import { dateLabel } from "@/lib/utils";
export default async function Dashboard() {
  const u = await requireUser();
  const own = canPublish(u.role) ? {} : { creatorId: u.id };
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const [
    total,
    drafts,
    scheduled,
    published,
    breaking,
    authors,
    views,
    comments,
    recent,
  ] = await Promise.all([
    db.article.count({ where: own }),
    db.article.count({ where: { ...own, status: "DRAFT" } }),
    db.article.count({ where: { ...own, status: "SCHEDULED" } }),
    db.article.count({
      where: { ...own, status: "PUBLISHED", publishedAt: { gte: today } },
    }),
    db.breakingNews.count({ where: { active: true } }),
    db.author.count(),
    db.article.aggregate({ where: own, _sum: { views: true } }),
    db.comment.count({ where: { approved: false } }),
    db.article.findMany({
      where: own,
      include: { author: true, category: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);
  return (
    <>
      <div className="admin-title">
        <div>
          <span className="eyebrow">आपका न्यूज़रूम</span>
          <h1>नमस्ते, {u.name}।</h1>
          <p>आज की खबरों और संपादकीय काम पर एक नज़र।</p>
        </div>
        <Link className="button" href="/admin/articles/new">
          ＋ नई खबर लिखें
        </Link>
      </div>
      <div className="stats-grid">
        {[
          ["कुल लेख", total],
          ["आज प्रकाशित (UTC)", published],
          ["ड्राफ्ट", drafts],
          ["निर्धारित", scheduled],
          ["सक्रिय ब्रेकिंग", breaking],
          ["लेखक", authors],
          ["कुल पेज व्यू", views._sum.views || 0],
          ["लंबित टिप्पणियाँ", comments],
        ].map(([label, n]) => (
          <div className="stat panel" key={label}>
            <span>{label}</span>
            <strong>{Number(n).toLocaleString("hi-IN")}</strong>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="section-heading">
          <h2>हाल के लेख</h2>
          <Link href="/admin/articles">सभी लेख →</Link>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>शीर्षक</th>
                <th>लेखक</th>
                <th>श्रेणी</th>
                <th>स्थिति</th>
                <th>अपडेट</th>
                <th>व्यू</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/articles/${a.id}`}>{a.title}</Link>
                  </td>
                  <td>{a.author.name}</td>
                  <td>{a.category.name}</td>
                  <td>
                    <span className={`status status-${a.status}`}>
                      {labels[a.status]}
                    </span>
                  </td>
                  <td>{dateLabel(a.updatedAt)}</td>
                  <td>{a.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!recent.length && <p className="empty">अपना पहला लेख बनाएँ।</p>}
        </div>
      </div>
    </>
  );
}
