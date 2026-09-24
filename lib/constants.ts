export const SITE_NAME = "Chopal Unfiltered";
export const TAGLINE = "आपकी भाषा में, आपकी आवाज़";
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");
export const demoMode = process.env.DEMO_MODE === "true";
export const nav = [
  ["देश", "desh"],
  ["राजनीति", "politics"],
  ["दुनिया", "world"],
  ["बिजनेस", "business"],
  ["खेल", "sports"],
  ["मनोरंजन", "entertainment"],
  ["टेक", "technology"],
  ["ओपिनियन", "opinion"],
  ["फैक्ट चेक", "fact-check"],
  ["वीडियो", "video"],
];
export const statuses = [
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "SCHEDULED",
  "REJECTED",
  "ARCHIVED",
] as const;
export const types = [
  "NEWS",
  "BREAKING",
  "GROUND_REPORT",
  "INVESTIGATION",
  "INTERVIEW",
  "OPINION",
  "EXPLAINER",
  "FACT_CHECK",
  "VIDEO",
] as const;
export const labels: Record<string, string> = {
  NEWS: "समाचार",
  BREAKING: "बड़ी खबर",
  GROUND_REPORT: "ग्राउंड रिपोर्ट",
  INVESTIGATION: "पड़ताल",
  INTERVIEW: "बातचीत",
  OPINION: "ओपिनियन",
  EXPLAINER: "समझिए",
  FACT_CHECK: "फैक्ट चेक",
  VIDEO: "वीडियो",
  DRAFT: "ड्राफ्ट",
  PENDING_REVIEW: "समीक्षा के लिए",
  APPROVED: "स्वीकृत",
  PUBLISHED: "प्रकाशित",
  SCHEDULED: "निर्धारित",
  REJECTED: "संशोधन आवश्यक",
  ARCHIVED: "आर्काइव",
};
export const policyPages: Record<string, string> = {
  about: "हमारे बारे में",
  contact: "संपर्क करें",
  "editorial-policy": "संपादकीय नीति",
  corrections: "सुधार नीति",
  "fact-check-policy": "फैक्ट चेक नीति",
  privacy: "गोपनीयता नीति",
  terms: "उपयोग की शर्तें",
  disclaimer: "अस्वीकरण",
  careers: "हमसे जुड़ें",
};
