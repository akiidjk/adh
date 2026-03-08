import type * as Monaco from "monaco-editor";

// ── Theme factory ─────────────────────────────────────────────────────────────
//
// Called on every mount and every theme toggle so that the computed values
// always reflect whichever set of CSS variables (`:root` or `.dark`) is
// currently active on `<html>`.

export function defineThemes(monaco: typeof Monaco): void {
  monaco.editor.defineTheme("adh-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", background: "#282a36" },
      { token: "comment", foreground: "#6272a4" },
      { token: "string", foreground: "#f1fa8c" },
      { token: "constant.numeric", foreground: "#bd93f9" },
      { token: "constant.language", foreground: "#bd93f9" },
      { token: "constant.character", foreground: "#bd93f9" },
      { token: "constant.other", foreground: "#bd93f9" },
      { token: "variable.other.readwrite.instance", foreground: "#ffb86c" },
      { token: "constant.character.escaped", foreground: "#ff79c6" },
      { token: "constant.character.escape", foreground: "#ff79c6" },
      { token: "string source", foreground: "#ff79c6" },
      { token: "string source.ruby", foreground: "#ff79c6" },
      { token: "keyword", foreground: "#ff79c6" },
      { token: "storage", foreground: "#ff79c6" },
      { token: "storage.type", foreground: "#8be9fd", fontStyle: "italic" },
      { token: "entity.name.class", foreground: "#50fa7b", fontStyle: "underline" },
      { token: "entity.other.inherited-class", foreground: "#50fa7b", fontStyle: "italic underline" },
      { token: "entity.name.function", foreground: "#50fa7b" },
      { token: "variable.parameter", foreground: "ffb86c", fontStyle: "italic" },
      { token: "entity.name.tag", foreground: "#ff79c6" },
      { token: "entity.other.attribute-name", foreground: "#50fa7b" },
      { token: "support.function", foreground: "#8be9fd" },
      { token: "support.constant", foreground: "#6be5fd" },
      { token: "support.type", foreground: "#66d9ef", fontStyle: "italic" },
      { token: "support.class", foreground: "#66d9ef", fontStyle: "italic" },
      { token: "invalid", foreground: "#f8f8f0", background: "#ff79c6" },
      { token: "invalid.deprecated", foreground: "#f8f8f0", background: "#bd93f9" },
      { token: "meta.structure.dictionary.json string.quoted.double.json", foreground: "#cfcfc2" },
      { token: "meta.diff", foreground: "#6272a4" },
      { token: "color.header", foreground: "#6272a4" },
      { token: "markup.deleted", foreground: "#ff79c6" },
      { token: "markup.inserted", foreground: "#50fa7b" },
      { token: "markup.changed", foreground: "#e6db74" },
      { token: "constant.numeric.line-number.find-in-files - match", foreground: "#bd93f9" },
      { token: "entity.name.filename", foreground: "#e6db74" },
      { token: "message.error", foreground: "#f83333" },
      { token: "punctuation.definition.string.begin.json - meta.structure.dictionary.value.json", foreground: "#eeeeee" },
      { token: "punctuation.definition.string.end.json - meta.structure.dictionary.value.json", foreground: "#eeeeee" },
      { token: "meta.structure.dictionary.json string.quoted.double.json", foreground: "#8be9fd" },
      { token: "meta.structure.dictionary.value.json string.quoted.double.json", foreground: "#f1fa8c" },
      { token: "meta meta meta meta meta meta meta.structure.dictionary.value string", foreground: "#50fa7b" },
      { token: "meta meta meta meta meta meta.structure.dictionary.value string", foreground: "#ffb86c" },
      { token: "meta meta meta meta meta.structure.dictionary.value string", foreground: "#ff79c6" },
      { token: "meta meta meta meta.structure.dictionary.value string", foreground: "#bd93f9" },
      { token: "meta meta meta meta.structure.dictionary.value string", foreground: "#50fa7b" },
      { token: "meta meta meta.structure.dictionary.value string", foreground: "#ffb86c" }
    ],
    colors: {
      "editor.foreground": "#f8f8f2",
      "editor.background": "#282a36",
      "editor.selectionBackground": "#44475a",
      "editor.lineHighlightBackground": "#44475a",
      "editorCursor.foreground": "#f8f8f0",
      "editorWhitespace.foreground": "#3B3A32",
      "editorIndentGuide.activeBackground": "#9D550FB0",
      "editor.selectionHighlightBorder": "#222218"
    },
  });
}
