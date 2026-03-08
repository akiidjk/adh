"use client";

import * as React from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import type * as Monaco from "monaco-editor";
import { defineThemes } from "./code-theme";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  placeholder?: string;
  language?: string;
  className?: string;
  minHeight?: string;
}


// ── Component ────────────────────────────────────────────────────────────────

export function CodeEditor({
  value,
  onChange,
  onSave,
  placeholder = "// Inserisci il tuo codice qui...",
  language = "html",
  className,
  minHeight = "400px",
}: CodeEditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const { resolvedTheme } = useTheme();

  const monacoTheme = resolvedTheme === "dark" ? "adh-dark" : "adh-light";
  // Re-define themes and re-apply whenever the active theme changes so that
  // the freshly-computed CSS variable values are always used.
  React.useEffect(() => {
    if (!editorRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monaco = (window as any).monaco as typeof Monaco | undefined;
    if (!monaco) return;
    defineThemes(monaco);
    monaco.editor.setTheme(monacoTheme);
  }, [monacoTheme]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Expose monaco on window so the effect above can reach it after mount.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).monaco = monaco;

    // Define themes with the current CSS variable values and apply immediately.
    defineThemes(monaco);
    monaco.editor.setTheme(monacoTheme);

    // Ctrl+S / Cmd+S → call onSave with the current model content.
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.(editor.getValue());
    });

    // Prevent the browser's native Save dialog from opening.
    editor.getDomNode()?.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") e.preventDefault();
    });
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border font-mono text-sm",
        className,
      )}
      style={{ minHeight }}
    >
      <Editor
        height={minHeight}
        language={language}
        value={value}
        theme={monacoTheme}
        onMount={handleMount}
        onChange={(val) => onChange(val ?? "")}
        options={{
          // Font
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontLigatures: true,
          fontSize: 14,
          lineHeight: 24,
          // Layout
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
          // UX
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          renderLineHighlight: "line",
          // Gutters
          lineNumbers: "on",
          glyphMargin: false,
          folding: true,
          // Scrollbar
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
          placeholder,
        }}
      />
    </div>
  );
}
