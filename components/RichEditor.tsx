"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
export default function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer" },
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose-editor",
        "aria-label": "लेख की सामग्री",
        role: "textbox",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  if (!editor)
    return <div className="editor-loading">संपादक लोड हो रहा है…</div>;
  return (
    <div className="rich-editor">
      <div className="editor-toolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-pressed={editor.isActive("bold")}
        >
          <b>B</b>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-pressed={editor.isActive("italic")}
        >
          <i>I</i>
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          सूची
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. सूची
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          उद्धरण
        </button>
        <button
          type="button"
          onClick={() => {
            const href = window.prompt("लिंक का https:// URL");
            if (href && /^https?:\/\//.test(href))
              editor.chain().focus().setLink({ href }).run();
          }}
        >
          लिंक
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          लिंक हटाएँ
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
        >
          पूर्ववत
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
