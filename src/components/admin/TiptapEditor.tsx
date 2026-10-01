import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  TextB,
  TextItalic,
  TextHTwo,
  TextHThree,
  ListBullets,
  ListNumbers,
  Quotes,
  ArrowUUpLeft,
  ArrowUUpRight,
} from "@phosphor-icons/react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || "<p>พิมพ์เนื้อหาข่าวสารที่นี่...</p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-[#B8923A]/30 rounded-[4px] overflow-hidden bg-[#FAF7F0] focus-within:border-[#4B1F7A] transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#EDE6F5]/40 border-b border-[#B8923A]/20 text-[#1B1226]/80 text-xs">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-[#FAF7F0] transition-colors ${
            editor.isActive("bold") ? "bg-[#4B1F7A] text-[#FAF7F0]" : ""
          }`}
          title="ตัวหนา"
        >
          <TextB weight="bold" className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-[#FAF7F0] transition-colors ${
            editor.isActive("italic") ? "bg-[#4B1F7A] text-[#FAF7F0]" : ""
          }`}
          title="ตัวเอียง"
        >
          <TextItalic weight="bold" className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-[#B8923A]/30 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-[#FAF7F0] transition-colors ${
            editor.isActive("heading", { level: 2 }) ? "bg-[#4B1F7A] text-[#FAF7F0]" : ""
          }`}
          title="หัวข้อย่อย 1"
        >
          <TextHTwo weight="bold" className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-[#FAF7F0] transition-colors ${
            editor.isActive("heading", { level: 3 }) ? "bg-[#4B1F7A] text-[#FAF7F0]" : ""
          }`}
          title="หัวข้อย่อย 2"
        >
          <TextHThree weight="bold" className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-[#B8923A]/30 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-[#FAF7F0] transition-colors ${
            editor.isActive("bulletList") ? "bg-[#4B1F7A] text-[#FAF7F0]" : ""
          }`}
          title="รายการสัญลักษณ์"
        >
          <ListBullets weight="bold" className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-[#FAF7F0] transition-colors ${
            editor.isActive("orderedList") ? "bg-[#4B1F7A] text-[#FAF7F0]" : ""
          }`}
          title="รายการตัวเลข"
        >
          <ListNumbers weight="bold" className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-[#FAF7F0] transition-colors ${
            editor.isActive("blockquote") ? "bg-[#4B1F7A] text-[#FAF7F0]" : ""
          }`}
          title="กล่องคำคม"
        >
          <Quotes weight="bold" className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-[#B8923A]/30 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-[#FAF7F0] disabled:opacity-40"
          title="เลิกทำ"
        >
          <ArrowUUpLeft weight="bold" className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-[#FAF7F0] disabled:opacity-40"
          title="ทำซ้ำ"
        >
          <ArrowUUpRight weight="bold" className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 min-h-[220px] font-sans text-sm sm:text-base leading-relaxed text-[#1B1226] focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
