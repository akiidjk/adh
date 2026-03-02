"use client";

import { Info, Plus, X, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UseFormReturn, FieldArrayWithId } from "react-hook-form";
import type { PageData } from "@/lib/models";

interface HeadersFieldProps {
  form: UseFormReturn<PageData>;
  headerFields: FieldArrayWithId<PageData, "headers">[];
  onAppend: (value: { key: string; value: string }) => void;
  onRemove: (index: number) => void;
}

export function HeadersField({
  form,
  headerFields,
  onAppend,
  onRemove,
}: HeadersFieldProps) {
  return (
    <FormItem>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FormLabel className="text-foreground">Response Headers</FormLabel>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Headers information"
                >
                  <Info className="size-4" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="font-medium">Custom Response Headers</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add HTTP headers to include in the response. Common examples:
                </p>
                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  <li>
                    -<code className="text-accent">Content-Type</code>:
                    text/html
                  </li>
                  <li>
                    -<code className="text-accent">X-Custom-Header</code>:
                    value
                  </li>
                  <li>
                    -<code className="text-accent">Cache-Control</code>:
                    no-cache
                  </li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {headerFields.length > 0 && (
            <Badge variant="secondary" className="text-xs tabular-nums">
              <Tags className="size-3 mr-1" aria-hidden="true" />
              {headerFields.length}
            </Badge>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAppend({ key: "", value: "" })}
          className="gap-1.5 text-xs h-7 border-border text-muted-foreground hover:text-foreground bg-transparent"
        >
          <Plus className="size-3" aria-hidden="true" />
          Add Header
        </Button>
      </div>

      {headerFields.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-input/50 py-6 text-muted-foreground cursor-pointer hover:bg-secondary/30 transition-colors"
          onClick={() => onAppend({ key: "", value: "" })}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              onAppend({ key: "", value: "" });
          }}
          aria-label="Add a response header"
        >
          <Tags className="size-6 opacity-40" aria-hidden="true" />
          <p className="text-sm">No custom headers</p>
          <p className="text-xs opacity-70">Click to add a response header</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Column labels */}
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1">
            <span className="text-xs text-muted-foreground font-medium">
              Header Name
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Value
            </span>
            <span className="w-8" />
          </div>

          {headerFields.map((headerField, index) => (
            <div
              key={headerField.id}
              className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start"
            >
              <FormField
                control={form.control}
                name={`headers.${index}.key`}
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Content-Type"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground font-mono text-sm h-9"
                        aria-label={`Header ${index + 1} name`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`headers.${index}.value`}
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="text/html; charset=utf-8"
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground font-mono text-sm h-9"
                        aria-label={`Header ${index + 1} value`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs mt-1" />
                  </FormItem>
                )}
              />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => onRemove(index)}
                      aria-label={`Remove header ${index + 1}`}
                    >
                      <X className="size-4" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove header</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onAppend({ key: "", value: "" })}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground w-full mt-1 border border-dashed border-border hover:border-muted-foreground h-8"
          >
            <Plus className="size-3" aria-hidden="true" />
            Add another header
          </Button>
        </div>
      )}

      <FormDescription>
        Optional HTTP headers returned with the response
      </FormDescription>
    </FormItem>
  );
}
