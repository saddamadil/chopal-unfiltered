import Link from "next/link";
import { notFound } from "next/navigation";
import { listStories, taxonomy, setting } from "@/lib/content";
import { NewsCard, Pagination } from "@/components/News";
import PublicForm from "@/components/PublicForm";
import { nav, policyPages, demoMode, siteUrl } from "@/lib/constants";
import { cleanHtml } from "@/lib/utils";
const special: Record<string, { title: string; type?: string }> = {
  latest: { title: "ताज़ा खबरें" },
  originals: { title: "चौपाल से", type: "GROUND_REPORT" },
  explainers: { title: "खबर को समझिए", type: "EXPLAINER" },
};
const policyCopy: Record<string, string> = {
  about:
    "<p>Chopal Unfiltered एक हिंदी डिजिटल समाचार मंच है। हमारी पहचान स्थानीय मुद्दों, लोगों की आवाज़ और स्पष्ट भाषा में संदर्भ देने की सोच से जुड़ी है।</p><p>इस संस्करण में उदाहरण सामग्री दी गई है। वास्तविक रिपोर्टिंग प्रकाशित करने से पहले संपादकीय टीम, स्वामित्व और संपर्क का विवरण जोड़ा जाना चाहिए।</p>",
  "editorial-policy":
    "<h2>तथ्य और संदर्भ</h2><p>प्रकाशन से पहले स्रोतों की पुष्टि, संबंधित पक्ष को जवाब देने का अवसर और स्पष्ट संदर्भ हमारी संपादकीय प्रक्रिया का हिस्सा हैं। खबर, राय, विज्ञापन और प्रायोजित सामग्री अलग-अलग चिह्नित होती हैं।</p><h2>पारदर्शिता</h2><p>लेखक, प्रकाशन समय और महत्वपूर्ण संशोधन लेख के साथ दिखाए जाते हैं। हितों के टकराव और प्रायोजन का खुलासा किया जाना चाहिए।</p>",
  corrections:
    "<h2>गलती दिखे तो बताइए</h2><p>लेख का लिंक, संभावित गलती और पुष्टिकरण के स्रोत संपर्क फ़ॉर्म से भेजें। संपादकीय टीम समीक्षा करेगी। तथ्यात्मक सुधार होने पर लेख में सुधार का विवरण स्पष्ट किया जाएगा।</p>",
  "fact-check-policy":
    "<h2>दावे की जाँच</h2><p>हम दावे का मूल स्रोत खोजते हैं, प्राथमिक दस्तावेज़ों से तुलना करते हैं और आवश्यक होने पर संबंधित विशेषज्ञों से बात करते हैं। निष्कर्ष के साथ प्रमाण और सीमाएँ स्पष्ट की जानी चाहिए।</p><p>सही, गलत, भ्रामक या अधूरे संदर्भ का निष्कर्ष पर्याप्त साक्ष्य होने पर ही दिया जाना चाहिए।</p>",
  privacy:
    "<h2>आपकी जानकारी</h2><p>फ़ॉर्म भेजने पर नाम, ईमेल और संदेश वेबसाइट के डेटाबेस में दर्ज होते हैं। टिप्पणियाँ समीक्षा के बाद सार्वजनिक हो सकती हैं; ईमेल सार्वजनिक नहीं किया जाता। समाचार पत्र के लिए ईमेल और सहमति दर्ज की जाती है।</p><h2>कुकी और नियंत्रण</h2><p>संपादकीय लॉगिन के लिए आवश्यक session cookie उपयोग होती है। बाहरी वीडियो लोड करने पर संबंधित प्रदाता की नीति लागू होगी। डेटा सुधार या हटाने का अनुरोध संपर्क फ़ॉर्म से भेजें।</p><p>लाइव संचालन से पहले संचालक का नाम, संपर्क, डेटा रखने की अवधि और लागू प्रक्रियाएँ इस नीति में जोड़ें।</p>",
  terms:
    "<h2>ज़िम्मेदार उपयोग</h2><p>सामग्री का उपयोग करते समय लेखक और स्रोत का सम्मान करें। धमकी, निजी जानकारी का अनधिकृत प्रकाशन, स्पैम और भ्रामक पहचान से टिप्पणियाँ स्वीकार नहीं की जातीं।</p><p>चित्रों और अन्य तृतीय पक्ष सामग्री के अलग लाइसेंस लागू हो सकते हैं। लाइव वेबसाइट के संचालक को इन शर्तों की समीक्षा करनी चाहिए।</p>",
  disclaimer:
    "<p>डेमो लेख केवल वेबसाइट की कार्यप्रणाली दिखाते हैं और वास्तविक समाचार नहीं हैं। राय वाले लेख संबंधित लेखक का दृष्टिकोण हैं। बाहरी लिंक और वीडियो के लिए उनके प्रकाशक ज़िम्मेदार हैं।</p>",
  careers:
    "<p>स्थानीय रिपोर्टिंग, संपादन या वीडियो पत्रकारिता में रुचि रखते हैं? संपर्क पेज पर अपना परिचय, कार्य का लिंक और रुचि का क्षेत्र भेजें। वर्तमान रिक्तियाँ घोषित होने पर यहाँ प्रकाशित होंगी।</p>",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title =
    policyPages[section] ||
    special[section]?.title ||
    nav.find((n) => n[1] === section)?.[0] ||
    ({ state: "राज्य", city: "शहर", credits: "चित्र श्रेय" } as any)[section];
  return { title, alternates: { canonical: `${siteUrl}/${section}` } };
}
export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { section } = await params;
  const p = await searchParams;
  if (section === "credits")
    return (
      <main id="main" className="wrap policy">
        <h1>चित्र श्रेय</h1>
        <p>
          ये फ़ाइल तस्वीरें उदाहरण सामग्री में उपयोग की गई हैं। कुछ कार्डों में
          display crop किया गया है।
        </p>
        <ul>
          <li>
            <a href="https://commons.wikimedia.org/wiki/File:Panoramic_view_of_Sabarmati_Riverfront_June_2015,_Ahmedabad.jpg">
              Sabarmati Riverfront
            </a>{" "}
            — Niharpatel123456,{" "}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/">
              CC BY-SA 4.0
            </a>
          </li>
          <li>
            <a href="https://commons.wikimedia.org/wiki/File:Farm_Life_Village_India.jpg">
              Farm Life Village India
            </a>{" "}
            — Meena Kadri,{" "}
            <a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a>
          </li>
          <li>
            <a href="https://commons.wikimedia.org/wiki/File:Street_market.JPG">
              Street market
            </a>{" "}
            — Milei.vencel,{" "}
            <a href="https://creativecommons.org/licenses/by-sa/3.0/">
              CC BY-SA 3.0
            </a>
          </li>
        </ul>
        <p>Chopal Unfiltered का लोगो उपयोगकर्ता द्वारा उपलब्ध कराया गया है।</p>
      </main>
    );
  if (policyPages[section]) {
    const content = await setting(`page:${section}`, policyCopy[section] || "");
    return (
      <main id="main" className="wrap policy">
        <span className="eyebrow">CHOPAL UNFILTERED</span>
        <h1>{policyPages[section]}</h1>
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: cleanHtml(content) }}
        />
        {section === "contact" && (
          <>
            <p>
              अपने क्षेत्र की खबर, सुझाव या सुधार का अनुरोध भेजें। कृपया
              संवेदनशील निजी जानकारी न भेजें।
            </p>
            <PublicForm kind="contact" demo={demoMode} />
          </>
        )}
        {section === "corrections" && (
          <Link className="button" href="/contact">
            सुधार का अनुरोध भेजें
          </Link>
        )}
      </main>
    );
  }
  if (section === "state" || section === "city") {
    const t = await taxonomy();
    return (
      <main id="main" className="wrap listing">
        <span className="eyebrow">स्थानीय आवाज़ें</span>
        <h1>{section === "state" ? "अपना राज्य चुनें" : "अपने शहर की खबर"}</h1>
        <div className="location-grid">
          {(section === "state" ? t.states : t.cities).map((s) => (
            <Link key={s.id} href={`/${section}/${s.slug}`}>
              <h2>{s.name}</h2>
              <span>खबरें पढ़ें ↗</span>
            </Link>
          ))}
        </div>
      </main>
    );
  }
  const t = await taxonomy();
  const category = t.categories.find((c) => c.slug === section);
  const spec = special[section];
  if (!category && !spec) notFound();
  const result = await listStories({
    ...(spec ? { type: spec.type } : { category: section }),
    page: Number(p.page) || 1,
  });
  return (
    <main id="main" className="wrap listing">
      <span className="eyebrow">चौपाल UNFILTERED</span>
      <h1>{category?.name || spec.title}</h1>
      {category?.description && (
        <p className="listing-intro">{category.description}</p>
      )}
      <div className="three-grid">
        {result.items.map((a) => (
          <NewsCard key={a.id} story={a} />
        ))}
      </div>
      {!result.total && (
        <div className="empty">
          इस सेक्शन में अभी कोई खबर प्रकाशित नहीं हुई है।
        </div>
      )}
      <Pagination {...result} base={`/${section}`} />
    </main>
  );
}
