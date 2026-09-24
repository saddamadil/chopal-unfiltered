import Link from "next/link";
import { ArrowUpRight, Quote, Mail, MapPin } from "lucide-react";
import { listStories, taxonomy } from "@/lib/content";
import {
  NewsCard,
  SectionHeading,
  StoryImage,
  FactCard,
} from "@/components/News";
import PublicForm from "@/components/PublicForm";
import AdSlot from "@/components/AdSlot";
import { articleUrl, dateLabel, jsonLd } from "@/lib/utils";
import { demoMode, siteUrl } from "@/lib/constants";
export default async function Home() {
  const [all, original, opinion, facts, video, t, featured, explainers] =
    await Promise.all([
      listStories({ limit: 8 }),
      listStories({ type: "GROUND_REPORT", limit: 3 }),
      listStories({ type: "OPINION", limit: 3 }),
      listStories({ type: "FACT_CHECK", limit: 3 }),
      listStories({ type: "VIDEO", limit: 3 }),
      taxonomy(),
      listStories({ featured: true, limit: 1 }),
      listStories({ type: "EXPLAINER", limit: 3 }),
    ]);
  const lead = featured.items[0] || all.items[0];
  const [local, national, business] = await Promise.all([
    listStories({ state: t.states[0]?.slug, limit: 3 }),
    listStories({ category: "desh", limit: 3 }),
    listStories({ category: "business", limit: 3 }),
  ]);
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                name: "Chopal Unfiltered",
                url: siteUrl,
                logo: `${siteUrl}/images/logo.png`,
              },
              {
                "@type": "WebSite",
                name: "Chopal Unfiltered",
                url: siteUrl,
                inLanguage: "hi-IN",
              },
            ],
          }),
        }}
      />
      <div className="wrap">
        <div className="edition-title">
          <span>खबर के पीछे की बात</span>
          <span>स्वतंत्र सोच। ज़मीन से जुड़ी आवाज़।</span>
        </div>
        {lead ? (
          <section className="hero-grid" aria-label="प्रमुख समाचार">
            <article className="hero-copy">
              <div className="eyebrow">
                खास रिपोर्ट{" "}
                <span className="demo-tag">
                  {lead.isDemo ? "डेमो" : lead.category.name}
                </span>
              </div>
              <h1>
                <Link href={articleUrl(lead)}>{lead.title}</Link>
              </h1>
              <p>{lead.excerpt}</p>
              <div className="byline">
                {lead.author.name} <span>·</span>{" "}
                {dateLabel(lead.publishedAt).split(",")[0]}
              </div>
              <Link className="read-link" href={articleUrl(lead)}>
                पूरी कहानी पढ़ें <ArrowUpRight size={19} />
              </Link>
            </article>
            <Link href={articleUrl(lead)} className="hero-picture">
              <StoryImage story={lead} priority />
              <span className="picture-label">
                <MapPin size={14} /> {lead.location || "ग्राउंड रिपोर्ट"}
              </span>
            </Link>
            <aside className="latest-rail">
              <h2>
                <span className="red-dot" /> अभी की खबरें
              </h2>
              {all.items
                .filter((s) => s.id !== lead.id)
                .slice(0, 4)
                .map((a, i) => (
                  <article key={a.id}>
                    <span className="rail-number">0{i + 1}</span>
                    <div>
                      <small>
                        {a.category.name}
                        {a.isDemo ? " · डेमो" : ""}
                      </small>
                      <h3>
                        <Link href={articleUrl(a)}>{a.title}</Link>
                      </h3>
                    </div>
                  </article>
                ))}
              <Link className="read-link" href="/latest">
                सभी ताज़ा खबरें <ArrowUpRight size={16} />
              </Link>
            </aside>
          </section>
        ) : (
          <section className="empty">
            <h1>चौपाल में आपका स्वागत है</h1>
            <p>पहली खबर प्रकाशित होने पर यहाँ दिखाई देगी।</p>
          </section>
        )}
        <section className="below-hero">
          {all.items
            .filter((a) => a.id !== lead?.id)
            .slice(0, 3)
            .map((a) => (
              <NewsCard key={a.id} story={a} compact />
            ))}
        </section>
        <AdSlot position="leaderboard" />
      </div>
      <div className="wrap category-duo">
        {[
          { title: "देश", href: "/desh", items: national.items },
          { title: "बिजनेस", href: "/business", items: business.items },
        ].map((section) => (
          <section className="section" key={section.href}>
            <SectionHeading title={section.title} href={section.href} />
            <div className="category-stories">
              {section.items.map((a) => (
                <NewsCard key={a.id} story={a} compact />
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className="originals">
        <div className="wrap">
          <SectionHeading
            title="चौपाल से"
            subtitle="ज़मीन से उठती खबरें"
            href="/originals"
            dark
          />
          <div className="three-grid">
            {original.items.map((a) => (
              <NewsCard key={a.id} story={a} />
            ))}
          </div>
        </div>
      </section>
      <div className="wrap">
        <section className="section">
          <SectionHeading title="आपका राज्य, आपकी खबर" href="/state" />
          <div className="state-pills">
            {t.states.map((s, i) => (
              <Link
                className={i === 0 ? "active" : ""}
                key={s.id}
                href={`/state/${s.slug}`}
              >
                {s.name} <ArrowUpRight size={15} />
              </Link>
            ))}
          </div>
          <div className="three-grid">
            {local.items.map((a) => (
              <NewsCard key={a.id} story={a} />
            ))}
          </div>
        </section>
        <section className="opinion-section section">
          <SectionHeading
            title="नज़रिया"
            subtitle="राय अलग हो सकती है। बातचीत ज़रूरी है।"
            href="/opinion"
          />
          <div className="three-grid">
            {opinion.items.map((a) => (
              <article className="opinion-card" key={a.id}>
                <Quote size={28} />
                <span className="eyebrow">
                  ओपिनियन {a.isDemo ? "· डेमो" : ""}
                </span>
                <h3>
                  <Link href={articleUrl(a)}>{a.title}</Link>
                </h3>
                <div className="author-row">
                  <span className="avatar">{a.author.name.slice(0, 1)}</span>
                  <div>
                    <Link href={`/author/${a.author.slug}`}>
                      {a.author.name}
                    </Link>
                    <small>{dateLabel(a.publishedAt).split(",")[0]}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        <AdSlot position="between-articles" />
      </div>
      <section className="video-section">
        <div className="wrap">
          <SectionHeading
            title="वीडियो चौपाल"
            subtitle="देखिए। सुनिए। समझिए।"
            href="/video"
            dark
          />
          <div className="three-grid">
            {video.items.map((a) => (
              <NewsCard key={a.id} story={a} />
            ))}
          </div>
        </div>
      </section>
      <div className="wrap">
        <section className="section">
          <SectionHeading
            title="दावे नहीं, तथ्य"
            subtitle="वायरल बातों की पूरी पड़ताल"
            href="/fact-check"
          />
          <div className="three-grid">
            {facts.items.map((a) => (
              <FactCard key={a.id} story={a} />
            ))}
          </div>
        </section>
        {explainers.items.length > 0 && (
          <section className="section">
            <SectionHeading
              title="खबर को समझिए"
              subtitle="जटिल सवाल। आसान भाषा।"
              href="/explainers"
            />
            <div className="three-grid">
              {explainers.items.map((a) => (
                <NewsCard key={a.id} story={a} />
              ))}
            </div>
          </section>
        )}
        <section id="newsletter" className="newsletter">
          <div>
            <Mail size={30} />
            <span className="eyebrow">चौपाल आपके इनबॉक्स में</span>
            <h2>
              दिन की ज़रूरी बातें।
              <br />
              सीधे आप तक।
            </h2>
            <p>हमारे समाचार पत्र के लिए अपना ईमेल दर्ज करें।</p>
          </div>
          <PublicForm kind="newsletter" demo={demoMode} />
        </section>
      </div>
    </main>
  );
}
