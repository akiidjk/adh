"use client";

import * as React from "react";
import {
  Info,
  CheckCircle2,
  AlertCircle,
  Copy,
} from "lucide-react";
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
import type { UseFormReturn } from "react-hook-form";
import type { PageData } from "@/lib/models";

interface EndpointFieldProps {
  form: UseFormReturn<PageData>;
  isValidEndpoint: boolean;
  endpointErrors: string[];
  onCopy: () => void;
}

export function EndpointField({
  form,
  isValidEndpoint,
  endpointErrors,
  onCopy,
}: EndpointFieldProps) {
  const endpoint = form.watch("endpoint");

  return (
    <FormField
      control={form.control}
      name="endpoint"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel className="text-foreground">Endpoint</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Endpoint information"
                  >
                    <Info className="size-4" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="font-medium">Endpoint requirements:</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    <li>-Must start with /</li>
                    <li>-Length: 2-99 characters</li>
                    <li>-Only letters, numbers, -, _ and /</li>
                  </ul>
                  <p className="mt-2 text-xs">
                    <span className="text-muted-foreground">Examples: </span>
                    <code className="text-accent">/about</code>,{" "}
                    <code className="text-accent">/dashboard/settings</code>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="relative">
            <FormControl>
              <Input
                {...field}
                type="text"
                placeholder="/your-page-endpoint"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-24 font-mono"
                aria-describedby="endpoint-description"
              />
            </FormControl>

            {endpoint && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isValidEndpoint ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="secondary"
                          className="bg-accent/20 text-accent text-xs cursor-help"
                        >
                          <CheckCircle2
                            className="size-3 mr-1"
                            aria-hidden="true"
                          />
                          Valid
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="font-medium">Valid endpoint</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          {endpoint.length} characters
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="secondary"
                          className="bg-destructive/20 text-destructive text-xs cursor-help"
                          role="status"
                          aria-live="polite"
                        >
                          <AlertCircle
                            className="size-3 mr-1"
                            aria-hidden="true"
                          />
                          Invalid
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="max-w-xs"
                        role="alert"
                      >
                        <p className="font-medium text-destructive">
                          Validation errors:
                        </p>
                        <ul className="mt-1 space-y-0.5 text-xs">
                          {endpointErrors.map((error, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-1.5"
                            >
                              <span className="text-destructive mt-0.5">•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-muted-foreground text-xs">
                            Valid format: /path, /path/subpath
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={onCopy}
                        aria-label="Copy endpoint"
                        disabled={!isValidEndpoint}
                      >
                        <Copy className="size-3" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isValidEndpoint ? "Copy endpoint" : "Invalid endpoint"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>

          <FormDescription id="endpoint-description">
            {"The page endpoint (2-99 characters, letters, numbers, -, _ and / only)"}
          </FormDescription>
          <FormMessage role="alert" />
        </FormItem>
      )}
    />
  );
}
