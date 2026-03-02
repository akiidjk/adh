import type * as Monaco from "monaco-editor";

// ── CSS variable reader ───────────────────────────────────────────────────────

/**
 * Read a CSS custom-property from the document root and return its value
 * trimmed of whitespace.  Falls back to `fallback` when called server-side
 * or when the variable is not defined.
 */
function cssVar(name: string, fallback = ""): string {
  if (typeof window === "undefined") return fallback;
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || fallback
  );
}

/**
 * Ensure the value is a bare 6-digit hex string (no leading `#`) suitable
 * for Monaco token rule `foreground` / `background` fields.
 * Handles both "#rrggbb" and "rrggbb" inputs.
 */
function toHex(value: string): string {
  return value.startsWith("#") ? value.slice(1) : value;
}

/**
 * Ensure the value is a `#rrggbb[aa]` string suitable for Monaco color fields.
 * Handles both "#rrggbb" and "rrggbb" inputs.
 */
function toColor(value: string): string {
  return value.startsWith("#") ? value : `#${value}`;
}

/**
 * Read a CSS variable and return it as a bare hex token (no `#`).
 */
function tokenColor(name: string, fallback: string): string {
  return toHex(cssVar(name, fallback));
}

/**
 * Read a CSS variable and return it as a `#rrggbb[aa]` color string.
 * An optional `alpha` suffix (two hex digits) is appended when provided.
 */
function editorColor(name: string, fallback: string, alpha = ""): string {
  return toColor(cssVar(name, fallback)) + alpha;
}

// ── Theme factory ─────────────────────────────────────────────────────────────
//
// Called on every mount and every theme toggle so that the computed values
// always reflect whichever set of CSS variables (`:root` or `.dark`) is
// currently active on `<html>`.

export function defineThemes(monaco: typeof Monaco): void {
  // ── Light theme (:root) ────────────────────────────────────────────────────
  monaco.editor.defineTheme("adh-light", {
    base: "vs",
    inherit: true,
    rules: [
      {
        token: "",
        foreground: tokenColor("--foreground", "030712"),
        background: tokenColor("--background", "ffffff"),
      },
      {
        token: "comment",
        foreground: tokenColor("--muted-foreground", "6b7280"),
        fontStyle: "italic",
      },
      {
        token: "keyword",
        foreground: tokenColor("--primary", "7c3aed"),
        fontStyle: "bold",
      },
      { token: "string", foreground: tokenColor("--chart-2", "2a9d90") },
      { token: "number", foreground: tokenColor("--chart-1", "e76e50") },
      { token: "delimiter", foreground: tokenColor("--secondary-foreground", "111827") },
      { token: "tag", foreground: tokenColor("--primary", "7c3aed") },
      { token: "attribute.name", foreground: tokenColor("--chart-2", "2a9d90") },
      { token: "attribute.value", foreground: tokenColor("--chart-1", "e76e50") },
      { token: "type", foreground: tokenColor("--chart-3", "274754") },
      { token: "variable", foreground: tokenColor("--foreground", "030712") },
      { token: "function", foreground: tokenColor("--primary", "7c3aed") },
    ],
    colors: {
      // editor chrome
      "editor.background": editorColor("--background", "#ffffff"),
      "editor.foreground": editorColor("--foreground", "#030712"),
      "editor.lineHighlightBackground": editorColor("--secondary", "#f3f4f6"),
      "editor.selectionBackground": editorColor("--primary", "#7c3aed", "33"),
      "editor.inactiveSelectionBackground": editorColor("--primary", "#7c3aed", "1a"),
      "editorCursor.foreground": editorColor("--primary", "#7c3aed"),
      // gutter
      "editorLineNumber.foreground": editorColor("--muted-foreground", "#6b7280"),
      "editorLineNumber.activeForeground": editorColor("--primary", "#7c3aed"),
      "editorGutter.background": editorColor("--secondary", "#f3f4f6"),
      // indent guides
      "editorIndentGuide.background1": editorColor("--border", "#e5e7eb"),
      "editorIndentGuide.activeBackground1": editorColor("--primary", "#7c3aed"),
      // widgets / dropdowns
      "editorWidget.background": editorColor("--background", "#ffffff"),
      "editorWidget.border": editorColor("--border", "#e5e7eb"),
      "editorSuggestWidget.background": editorColor("--background", "#ffffff"),
      "editorSuggestWidget.border": editorColor("--border", "#e5e7eb"),
      "editorSuggestWidget.selectedBackground": editorColor("--secondary", "#f3f4f6"),
      "editorSuggestWidget.highlightForeground": editorColor("--primary", "#7c3aed"),
      // scrollbar
      "scrollbarSlider.background": editorColor("--border", "#e5e7eb", "99"),
      "scrollbarSlider.hoverBackground": editorColor("--border", "#e5e7eb", "cc"),
      "scrollbarSlider.activeBackground": editorColor("--primary", "#7c3aed", "66"),
      // misc
      "focusBorder": editorColor("--ring", "#7c3aed"),
      "editorBracketMatch.background": editorColor("--primary", "#7c3aed", "22"),
      "editorBracketMatch.border": editorColor("--primary", "#7c3aed"),
    },
  });

  // ── Dark theme (.dark) ─────────────────────────────────────────────────────
  monaco.editor.defineTheme("adh-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      {
        token: "",
        foreground: tokenColor("--foreground", "f9fafb"),
        background: tokenColor("--background", "030712"),
      },
      {
        token: "comment",
        foreground: tokenColor("--muted-foreground", "9ca3af"),
        fontStyle: "italic",
      },
      {
        token: "keyword",
        foreground: tokenColor("--chart-2", "af57db"),
        fontStyle: "bold",
      },
      { token: "string", foreground: tokenColor("--primary", "6d28d9") },
      { token: "number", foreground: tokenColor("--chart-2", "af57db") },
      { token: "delimiter", foreground: tokenColor("--foreground", "f9fafb") },
      { token: "tag", foreground: tokenColor("--sidebar-primary", "7821ff") },
      { token: "attribute.name", foreground: tokenColor("--chart-2", "af57db") },
      { token: "attribute.value", foreground: tokenColor("--primary", "6d28d9") },
      { token: "type", foreground: tokenColor("--chart-3", "3127d9") },
      { token: "variable", foreground: tokenColor("--foreground", "f9fafb") },
      { token: "function", foreground: tokenColor("--chart-2", "af57db") },
    ],
    colors: {
      // editor chrome
      "editor.background": editorColor("--background", "#030712"),
      "editor.foreground": editorColor("--foreground", "#f9fafb"),
      "editor.lineHighlightBackground": editorColor("--secondary", "#1f2937"),
      "editor.selectionBackground": editorColor("--primary", "#6d28d9", "66"),
      "editor.inactiveSelectionBackground": editorColor("--primary", "#6d28d9", "33"),
      "editorCursor.foreground": editorColor("--sidebar-primary", "#7821ff"),
      // gutter
      "editorLineNumber.foreground": editorColor("--muted-foreground", "#9ca3af"),
      "editorLineNumber.activeForeground": editorColor("--chart-2", "#af57db"),
      "editorGutter.background": editorColor("--background", "#030712"),
      // indent guides
      "editorIndentGuide.background1": editorColor("--border", "#1f2937"),
      "editorIndentGuide.activeBackground1": editorColor("--primary", "#6d28d9"),
      // widgets / dropdowns
      "editorWidget.background": editorColor("--background", "#030712"),
      "editorWidget.border": editorColor("--border", "#1f2937"),
      "editorSuggestWidget.background": editorColor("--background", "#030712"),
      "editorSuggestWidget.border": editorColor("--border", "#1f2937"),
      "editorSuggestWidget.selectedBackground": editorColor("--secondary", "#1f2937"),
      "editorSuggestWidget.highlightForeground": editorColor("--chart-2", "#af57db"),
      // scrollbar
      "scrollbarSlider.background": editorColor("--secondary", "#1f2937", "99"),
      "scrollbarSlider.hoverBackground": editorColor("--secondary", "#1f2937", "cc"),
      "scrollbarSlider.activeBackground": editorColor("--primary", "#6d28d9", "66"),
      // misc
      "focusBorder": editorColor("--ring", "#6d28d9"),
      "editorBracketMatch.background": editorColor("--primary", "#6d28d9", "22"),
      "editorBracketMatch.border": editorColor("--chart-2", "#af57db"),
    },
  });
}
