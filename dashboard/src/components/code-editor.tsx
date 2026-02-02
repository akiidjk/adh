"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function CodeEditor({
  value,
  onChange,
  placeholder = "// Inserisci il tuo codice qui...",
  className,
  minHeight = "400px",
}: CodeEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);

  const lines = value.split("\n");
  const lineCount = Math.max(lines.length, 20);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + "  " + value.substring(end);
        onChange(newValue);
        // Set cursor position after tab
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  return (
    <div
      className={cn(
        "relative flex overflow-hidden rounded-lg border border-border bg-input font-mono text-sm",
        className
      )}
      style={{ minHeight }}
    >
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        className="flex-shrink-0 select-none overflow-hidden bg-secondary/50 px-3 py-3 text-right text-muted-foreground"
        style={{ minHeight }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="leading-6">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code area */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          spellCheck={false}
          className={cn(
            "absolute inset-0 h-full w-full resize-none bg-transparent p-3 leading-6 text-foreground placeholder:text-muted-foreground focus:outline-none",
            "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border"
          )}
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}
