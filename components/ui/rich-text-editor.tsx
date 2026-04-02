"use client";

import { useEffect, useRef } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type EditorAction = {
  label: string;
  command: string;
  title: string;
  value?: string;
};

const actions: EditorAction[] = [
  { label: "B", command: "bold", title: "Bold" },
  { label: "I", command: "italic", title: "Italic" },
  { label: "Bullet List", command: "insertUnorderedList", title: "Bullet list" },
  { label: "Numbered List", command: "insertOrderedList", title: "Numbered list" },
  { label: "Quote", command: "formatBlock", value: "blockquote", title: "Quote" }
];

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const syncValue = () => {
    onChange(editorRef.current?.innerHTML ?? "");
  };

  const runCommand = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    syncValue();
  };

  return (
    <div className="rounded-[1.5rem] border border-border/80 bg-white/80 p-3 dark:bg-white/5">
      <div className="mb-3 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.title}
            type="button"
            onClick={() => runCommand(action.command, action.value)}
            className="rounded-full border border-border/80 px-3 py-1 text-xs font-semibold text-foreground/70 transition hover:border-accent hover:bg-accentSoft"
          >
            {action.label}
          </button>
        ))}
      </div>
      <div className="relative">
        {!value ? (
          <span className="pointer-events-none absolute left-4 top-4 text-sm text-foreground/35">
            {placeholder}
          </span>
        ) : null}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="diary-prose min-h-[220px] rounded-[1rem] bg-white/70 px-4 py-4 outline-none dark:bg-white/5"
          onInput={syncValue}
          onBlur={syncValue}
        />
      </div>
    </div>
  );
}
