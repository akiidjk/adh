"use client";

import * as React from "react";
import { Info, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import {
  COMMON_STATUS_CODES,
  getStatusCodeBadgeClass,
  getStatusCodeColor,
  getStatusCodeLabel,
} from "@/lib/status-code";

interface StatusCodeFieldProps {
  form: UseFormReturn<PageData>;
  statusCodeNum: number;
  isValidStatusCode: boolean;
}

export function StatusCodeField({
  form,
  statusCodeNum,
  isValidStatusCode,
}: StatusCodeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="statusCode"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel className="text-foreground">Status Code</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Status code information"
                  >
                    <Info className="size-4" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="font-medium">HTTP Status Code</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    The HTTP status code returned when this endpoint is
                    requested. Must be between 100 and 599.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-3">
            {/* Quick-select chips */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_STATUS_CODES.map(({ code, label }) => {
                const isSelected = statusCodeNum === code;
                const ringColor =
                  code >= 200 && code < 300
                    ? "ring-emerald-500"
                    : code >= 300 && code < 400
                      ? "ring-blue-400"
                      : code >= 400 && code < 500
                        ? "ring-amber-500"
                        : "ring-destructive";

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() =>
                      form.setValue("statusCode", code, {
                        shouldValidate: true,
                      })
                    }
                    className={`inline-flex items-center gap-1 text-xs font-mono px-2 py-1 rounded border transition-all ${isSelected
                        ? `${getStatusCodeBadgeClass(code)} ring-1 ring-offset-1 ring-offset-background ${ringColor}`
                        : "bg-secondary/50 text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                      }`}
                    aria-pressed={isSelected}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Custom numeric input */}
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={100}
                  max={599}
                  placeholder="200"
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    field.onChange(isNaN(val) ? 200 : val);
                  }}
                  value={field.value ?? 200}
                  className={`bg-input border-border placeholder:text-muted-foreground pl-9 pr-20 font-mono w-48 ${isValidStatusCode
                      ? getStatusCodeColor(statusCodeNum)
                      : "text-destructive"
                    }`}
                  aria-describedby="status-code-description"
                />
              </FormControl>
              {isValidStatusCode && (
                <span
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${getStatusCodeColor(statusCodeNum)}`}
                >
                  {getStatusCodeLabel(statusCodeNum)}
                </span>
              )}
            </div>
          </div>

          <FormDescription id="status-code-description">
            HTTP status code returned by this endpoint (100–599)
          </FormDescription>
          <FormMessage role="alert" />
        </FormItem>
      )}
    />
  );
}
