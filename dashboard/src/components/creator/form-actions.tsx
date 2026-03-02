"use client";

import * as React from "react";
import { Trash2, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FormActionsProps {
  isLoading: boolean;
  isEditMode: boolean;
  canSubmit: boolean;
  isValidEndpoint: boolean;
  hasContent: boolean;
  hasAnything: boolean;
  onReset: () => void;
  onSubmit: () => void;
}

export function FormActions({
  isLoading,
  isEditMode,
  canSubmit,
  isValidEndpoint,
  hasContent,
  hasAnything,
  onReset,
  onSubmit,
}: FormActionsProps) {
  const submitLabel = isEditMode ? "Update Page" : "Create Page";
  const submittingLabel = isEditMode ? "Updating..." : "Creating...";

  const disabledReason = !isValidEndpoint
    ? "Enter a valid endpoint (e.g.: /about)"
    : !hasContent
      ? "Enter code or upload a file"
      : undefined;

  return (
    <div className="flex items-center gap-3 pt-4">
      {/* Reset button — guarded by a confirm dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-border text-muted-foreground hover:text-foreground bg-transparent"
            disabled={!hasAnything}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Reset
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to reset?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all data entered in the form. You won&apos;t be
              able to recover your changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit button — wrapped in a tooltip that explains why it is disabled */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* span keeps the tooltip working even when the button is disabled */}
            <span className="flex-1">
              <Button
                type="button"
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!canSubmit}
                onClick={onSubmit}
              >
                {isLoading ? (
                  <>
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    {submittingLabel}
                  </>
                ) : (
                  <>
                    <Send className="size-4" aria-hidden="true" />
                    {submitLabel}
                  </>
                )}
              </Button>
            </span>
          </TooltipTrigger>
          {disabledReason && (
            <TooltipContent>{disabledReason}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
