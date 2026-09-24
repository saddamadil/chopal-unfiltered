export type Field = {
  key: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "checkbox"
    | "number"
    | "datetime-local"
    | "select"
    | "password";
  required?: boolean;
  options?: string[];
  relation?: string;
};
export type Resource = {
  title: string;
  model: string;
  adminOnly?: boolean;
  readOnly?: boolean;
  fields: Field[];
};
const name = { key: "name", label: "नाम", required: true },
  slug = { key: "slug", label: "Slug", required: true };
export const resources: Record<string, Resource> = {
  categories: {
    title: "श्रेणियाँ",
    model: "category",
    fields: [
      name,
      slug,
      { key: "description", label: "विवरण", type: "textarea" },
    ],
  },
  subcategories: {
    title: "उपश्रेणियाँ",
    model: "subcategory",
    fields: [
      name,
      slug,
      {
        key: "categoryId",
        label: "श्रेणी",
        relation: "categories",
        required: true,
      },
    ],
  },
  authors: {
    title: "लेखक",
    model: "author",
    fields: [
      name,
      slug,
      { key: "bio", label: "परिचय", type: "textarea", required: true },
      { key: "image", label: "तस्वीर URL" },
      { key: "userId", label: "संबंधित उपयोगकर्ता", relation: "users" },
    ],
  },
  tags: { title: "टैग", model: "tag", fields: [name, slug] },
  states: { title: "राज्य", model: "state", fields: [name, slug] },
  cities: {
    title: "शहर",
    model: "city",
    fields: [
      name,
      slug,
      { key: "stateId", label: "राज्य", relation: "states", required: true },
    ],
  },
  breaking: {
    title: "ब्रेकिंग न्यूज़",
    model: "breakingNews",
    fields: [
      { key: "title", label: "खबर", required: true },
      { key: "url", label: "लिंक" },
      { key: "priority", label: "प्राथमिकता", type: "number" },
      { key: "active", label: "सक्रिय", type: "checkbox" },
      { key: "startsAt", label: "शुरुआत", type: "datetime-local" },
      { key: "endsAt", label: "समाप्ति", type: "datetime-local" },
    ],
  },
  advertisements: {
    title: "विज्ञापन",
    model: "advertisement",
    adminOnly: true,
    fields: [
      name,
      { key: "image", label: "क्रिएटिव URL", required: true },
      { key: "alt", label: "तस्वीर विवरण", required: true },
      { key: "url", label: "लिंक", required: true },
      {
        key: "position",
        label: "स्थान",
        type: "select",
        required: true,
        options: [
          "header",
          "leaderboard",
          "in-article",
          "sidebar",
          "between-articles",
          "mobile-banner",
          "desktop-banner",
        ],
      },
      { key: "active", label: "सक्रिय", type: "checkbox" },
      { key: "startsAt", label: "शुरुआत", type: "datetime-local" },
      { key: "endsAt", label: "समाप्ति", type: "datetime-local" },
    ],
  },
  comments: {
    title: "टिप्पणियाँ",
    model: "comment",
    fields: [{ key: "approved", label: "प्रकाशन स्वीकृत", type: "checkbox" }],
  },
  users: {
    title: "उपयोगकर्ता",
    model: "user",
    adminOnly: true,
    fields: [
      name,
      { key: "email", label: "ईमेल", required: true },
      {
        key: "password",
        label: "नया पासवर्ड (न्यूनतम 14 अक्षर)",
        type: "password",
      },
      {
        key: "role",
        label: "भूमिका",
        type: "select",
        required: true,
        options: ["SUPER_ADMIN", "ADMIN", "EDITOR", "REPORTER", "AUTHOR"],
      },
      { key: "active", label: "सक्रिय", type: "checkbox" },
    ],
  },
  settings: {
    title: "सेटिंग्स व नीतियाँ",
    model: "setting",
    adminOnly: true,
    fields: [
      {
        key: "id",
        label: "सेटिंग कुंजी",
        required: true,
        type: "select",
        options: [
          "page:about",
          "page:contact",
          "page:editorial-policy",
          "page:corrections",
          "page:fact-check-policy",
          "page:privacy",
          "page:terms",
          "page:disclaimer",
          "page:careers",
        ],
      },
      {
        key: "value",
        label: "पेज सामग्री (HTML)",
        type: "textarea",
        required: true,
      },
    ],
  },
  subscribers: {
    title: "समाचार पत्र सदस्य",
    model: "subscriber",
    adminOnly: true,
    readOnly: true,
    fields: [],
  },
  messages: {
    title: "पाठक संदेश",
    model: "contactMessage",
    readOnly: true,
    fields: [],
  },
  audit: {
    title: "गतिविधि लॉग",
    model: "auditLog",
    adminOnly: true,
    readOnly: true,
    fields: [],
  },
};
