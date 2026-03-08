"use client";

import * as React from "react";
import { Code2, Upload, FileCode, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CodeEditor } from "@/components/code-editor";
import type { UseFormReturn } from "react-hook-form";
import type { PageData } from "@/lib/models";

const CODE_PLACEHOLDER = `// Enter your page code here...`;

interface ContentFieldProps {
  form: UseFormReturn<PageData>;
  inputMethod: "code" | "upload";
  onInputMethodChange: (method: "code" | "upload") => void;
  uploadedFile: File | null;
  onUploadedFileClear: () => void;
  isDragOver: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onFileSelect: (file: File) => void;
  onSave?: () => void;
  minHeight?: string;
}

export function ContentField({
  form,
  inputMethod,
  onInputMethodChange,
  uploadedFile,
  onUploadedFileClear,
  isDragOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileSelect,
  onSave,
  minHeight = "350px",
}: ContentFieldProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const body = form.watch("body");

  const [language, setLanguage] = React.useState<
    "html" | "css" | "json" | "yaml" | "toml" | "xml" | "javascript"
  >("html");

  // Auto-detect language from uploaded file extension
  React.useEffect(() => {
    if (!uploadedFile) return;
    const ext = uploadedFile.name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "js":
        setLanguage("json");
        break;
      case "yaml":
      case "yml":
        setLanguage("yaml");
        break;
      case "toml":
        setLanguage("toml");
        break;
      case "xml":
        setLanguage("xml");
        break;
      case "js":
        setLanguage("javascript");
        break;
      case "css":
        setLanguage("css");
        break;
      case "html":
      case "htm":
        setLanguage("html");
        break;
      default:
        // leave as-is if unknown
        break;
    }
  }, [uploadedFile]);

  const LANGUAGE_OPTIONS: { label: string; value: typeof language }[] = [
    { label: "HTML", value: "html" },
    { label: "CSS", value: "css" },
    { label: "JSON", value: "json" },
    { label: "YAML", value: "yaml" },
    { label: "TOML", value: "toml" },
    { label: "XML", value: "xml" },
    { label: "JavaScript", value: "javascript" },
  ];

  return (
    <FormField
      control={form.control}
      name="body"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground">Content</FormLabel>

          <Tabs
            value={inputMethod}
            onValueChange={(v) => onInputMethodChange(v as "code" | "upload")}
            className="w-full"
          >
            <TabsList variant={"line"} className="grid w-full grid-cols-2">
              <TabsTrigger value="code" className="gap-2">
                <Code2 className="size-4" aria-hidden="true" />
                Code Editor
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="gap-2 data-[state=active]:bg-card"
              >
                <Upload className="size-4" aria-hidden="true" />
                Upload File
              </TabsTrigger>
            </TabsList>

            {/* ── Code editor tab ── */}
            <TabsContent value="code" className="mt-4">
              <div className="mb-2 flex items-center justify-end gap-2">
                <label htmlFor="language-select" className="sr-only">
                  Language
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value as typeof language)
                  }
                  className="rounded-md border px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Select language"
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <FormControl>
                <CodeEditor
                  language={language}
                  value={field.value || ""}
                  onChange={(value) =>
                    form.setValue("body", value, { shouldValidate: true })
                  }
                  onSave={(latestValue) => {
                    // Flush the latest editor value into the form before
                    // triggering submission so validation sees up-to-date data.
                    form.setValue("body", latestValue, { shouldValidate: true });
                    onSave?.();
                  }}
                  placeholder={CODE_PLACEHOLDER}
                  minHeight={minHeight}
                />
              </FormControl>
              {body && (
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{body.split("\n").length} lines</span>
                  <span>{body.length} characters</span>
                </div>
              )}
            </TabsContent>

            {/* ── File upload tab ── */}
            <TabsContent value="upload" className="mt-4">
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    fileInputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Click or drag to upload a file"
                className={[
                  "relative flex cursor-pointer flex-col items-center justify-center gap-4",
                  "rounded-lg border-2 border-dashed transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isDragOver
                    ? "border-accent bg-accent/10"
                    : "border-border bg-input hover:border-muted-foreground hover:bg-secondary/50",
                ].join(" ")}
                style={{ minHeight }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".tsx,.ts,.jsx,.js,.html,.css"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFileSelect(file);
                  }}
                  className="sr-only"
                  aria-label="Select file"
                />

                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex size-16 items-center justify-center rounded-full bg-accent/20">
                      <FileCode
                        className="size-8 text-accent"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUploadedFileClear();
                      }}
                      className="gap-2"
                    >
                      <X className="size-4" aria-hidden="true" />
                      Remove file
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
                      <Upload
                        className="size-8 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">
                        Drag your file here
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to select
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground opacity-70">
                        .js, .html, .css, .json  (max 5MB)
                      </p>
                    </div>
                  </>
                )}
              </div>

              {uploadedFile && body && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Content preview</span>
                    <Badge variant="secondary">
                      {body.split("\n").length} lines
                    </Badge>
                  </div>
                  <div className="max-h-32 overflow-auto rounded-lg bg-input p-3 font-mono text-xs">
                    <pre className="text-muted-foreground">
                      {body.slice(0, 500)}
                      {body.length > 500 && "..."}
                    </pre>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <FormDescription>
            Enter the code directly or upload a file
          </FormDescription>
          <FormMessage role="alert" />
        </FormItem>
      )}
    />
  );
}
