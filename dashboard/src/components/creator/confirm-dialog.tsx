"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getStatusCodeColor } from "@/lib/status-code";
import type { PageData } from "@/lib/models";
import type { FieldArrayWithId } from "react-hook-form";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  endpoint: string;
  statusCodeNum: number;
  headerFields: FieldArrayWithId<PageData, "headers">[];
  headers: PageData["headers"];
  inputMethod: "code" | "upload";
  uploadedFileName?: string;
  bodyLength: number;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  isEditMode,
  endpoint,
  statusCodeNum,
  headerFields,
  headers,
  inputMethod,
  uploadedFileName,
  bodyLength,
  onConfirm,
}: ConfirmDialogProps) {
  const filledHeaders = headers.filter((h) => h.key.trim() !== "");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isEditMode ? "Confirm page update" : "Confirm page creation"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                {isEditMode
                  ? "You're about to update the page with the following details:"
                  : "You're about to create a new page with the following details:"}
              </p>

              <div className="rounded-lg bg-secondary p-3 space-y-2">
                {/* Endpoint */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm shrink-0">
                    Endpoint:
                  </span>
                  <code className="rounded bg-input px-2 py-0.5 font-mono text-foreground text-sm">
                    {endpoint}
                  </code>
                </div>

                {/* Status code */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm shrink-0">
                    Status Code:
                  </span>
                  <span
                    className={`font-mono text-sm font-medium ${getStatusCodeColor(statusCodeNum)}`}
                  >
                    {statusCodeNum}
                  </span>
                </div>

                {/* Headers */}
                {headerFields.length > 0 && filledHeaders.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground text-sm shrink-0">
                      Headers:
                    </span>
                    <div className="space-y-0.5">
                      {filledHeaders.map((h, i) => (
                        <div key={i} className="font-mono text-xs">
                          <span className="text-accent">{h.key}</span>
                          <span className="text-muted-foreground">: </span>
                          <span className="text-foreground">{h.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Source */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm shrink-0">
                    Source:
                  </span>
                  <span className="text-foreground text-sm">
                    {inputMethod === "code" ? "Code editor" : uploadedFileName}
                  </span>
                </div>

                {/* Size */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm shrink-0">
                    Size:
                  </span>
                  <span className="text-foreground text-sm">
                    {bodyLength} characters
                  </span>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {isEditMode ? "Confirm and Update" : "Confirm and Create"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
