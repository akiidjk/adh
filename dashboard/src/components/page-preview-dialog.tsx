"use client";

import * as React from "react";
import { Code2, Eye, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface PagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  endpoint: string;
  code: string;
}

export function PagePreviewDialog({
  open,
  onOpenChange,
  endpoint,
  code,
}: PagePreviewDialogProps) {
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"preview" | "code">("preview");

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code.split("\n").length;
  const charCount = code.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <code className="font-mono text-foreground">/{endpoint}</code>
              </DialogTitle>
              <DialogDescription className="mt-1">
                View and preview the page content for this endpoint.
              </DialogDescription>
            </div>
            <Badge variant="outline" className="shrink-0">
              {lineCount} lines
            </Badge>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "preview" | "code")}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="size-4" aria-hidden="true" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Code2 className="size-4" aria-hidden="true" />
                Codice
              </TabsTrigger>
            </TabsList>

            {activeTab === "code" && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyCode}
                className="gap-2 bg-transparent"
              >
                {copied ? (
                  <>
                    <Check className="size-4" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-4" aria-hidden="true" />
                    Copy
                  </>
                )}
              </Button>
            )}
          </div>

          <TabsContent
            value="preview"
            className="flex-1 mt-4 min-h-0 overflow-auto"
          >
            <div className="rounded-lg border border-border bg-card min-h-100 p-4">
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                          font-family: system-ui, -apple-system, sans-serif;
                          padding: 16px;
                          background: #0a0a0a;
                          color: #fafafa;
                        }
                        h1, h2, h3, h4, h5, h6 { margin-bottom: 0.5em; }
                        p { margin-bottom: 1em; }
                        a { color: #3b82f6; }
                        code { background: #1f2937; padding: 2px 6px; border-radius: 4px; }
                        pre { background: #1f2937; padding: 16px; border-radius: 8px; overflow-x: auto; }
                      </style>
                    </head>
                    <body>${code}</body>
                  </html>
                `}
                className="w-full h-100 rounded-lg bg-background"
                title={`Preview of /${endpoint}`}
                sandbox="allow-scripts"
              />
            </div>
          </TabsContent>

          <TabsContent
            value="code"
            className="flex-1 mt-4 min-h-0 overflow-auto"
          >
            <div className="rounded-lg border border-border bg-input overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50">
                <span className="text-xs text-muted-foreground font-mono">
                  source.tsx
                </span>
                <span className="text-xs text-muted-foreground">
                  {charCount} characters
                </span>
              </div>
              <div className="relative max-h-100 overflow-auto">
                <div className="absolute left-0 top-0 w-12 h-full bg-secondary/30 border-r border-border">
                  <div className="p-4 font-mono text-xs text-muted-foreground text-right">
                    {code.split("\n").map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                </div>
                <pre className="p-4 pl-16 font-mono text-sm text-foreground whitespace-pre-wrap wrap-break-words">
                  <code>{code}</code>
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
