"use client";

import * as React from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import {
  FileCode,
  Trash2,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  FolderOpen,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PagePreviewDialog } from "@/components/page-preview-dialog";

type PagesData = Record<string, string>;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SavedPagesListProps {
  refreshTrigger?: number;
  onEdit?: (endpoint: string, code: string) => void;
}

export function SavedPagesList({ refreshTrigger, onEdit }: SavedPagesListProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [deletingEndpoint, setDeletingEndpoint] = React.useState<string | null>(null);
  const [previewPage, setPreviewPage] = React.useState<{
    endpoint: string;
    code: string;
  } | null>(null);

  const { data, error, isValidating, isLoading, mutate: refreshData } = useSWR<PagesData>(
    "/api/create",
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
    }
  );

  // Consider the SWR "loading" state to be when:
  // - the isLoading flag is true (SWR v2), OR
  // - isValidating is true (SWR v1/v2), OR
  // - there is no data and no error (initial fetch)
  const isFetching = Boolean(isLoading || isValidating || (!data && !error));

  React.useEffect(() => {
    if (refreshTrigger) {
      refreshData();
    }
  }, [refreshTrigger, refreshData]);

  const handleDelete = async (endpoint: string) => {
    setDeletingEndpoint(endpoint);

    try {
      const response = await fetch(
        `/api/create?endpoint=${encodeURIComponent(endpoint)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error during deletion");
      }

      toast.success("Page deleted", {
        description: `/${endpoint} removed successfully`,
      });

      refreshData();
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Unable to delete the page",
      });
    } finally {
      setDeletingEndpoint(null);
    }
  };

  const pages = data ? Object.entries(data) : [];
  const isEmpty = pages.length === 0;

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              aria-expanded={isOpen}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                <FolderOpen className="size-5 text-accent" aria-hidden="true" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  Saved Pages
                  <Badge variant="secondary" className="text-xs">
                    {isFetching ? "..." : pages.length}
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage your saved pages and endpoints
                </p>
              </div>
              {isOpen ? (
                <ChevronUp className="size-5 text-muted-foreground ml-2" />
              ) : (
                <ChevronDown className="size-5 text-muted-foreground ml-2" />
              )}
            </button>
          </CollapsibleTrigger>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => refreshData()}
                  disabled={isFetching}
                  aria-label="Refresh list"
                >
                  <RefreshCw
                    className={`size-4 ${isFetching ? "animate-spin" : ""}`}
                    aria-hidden="true"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh list</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <CollapsibleContent className="mt-2">
          <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
            {isFetching ? (
              <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                <span>Loading...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center gap-3 py-12 text-destructive">
                <AlertCircle className="size-5" aria-hidden="true" />
                <span>Error during the loading of pages</span>
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                <FileCode className="size-10 opacity-50" aria-hidden="true" />
                <div className="text-center">
                  <p className="font-medium">No saved pages</p>
                  <p className="text-sm">
                    Create your first page using the form above
                  </p>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-border" role="list">
                {pages.map(([endpoint, code]) => (
                  <li
                    key={endpoint}
                    className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded bg-secondary">
                        <FileCode
                          className="size-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0">
                        <code className="text-sm font-mono text-foreground truncate block">
                          /{endpoint}
                        </code>
                        <span className="text-xs text-muted-foreground">
                          {code.length} characters
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() =>
                                setPreviewPage({ endpoint, code })
                              }
                              aria-label={`View /${endpoint}`}
                            >
                              <Eye className="size-4" aria-hidden="true" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {onEdit && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => onEdit(endpoint, code)}
                                aria-label={`Edit /${endpoint}`}
                              >
                                <Edit className="size-4" aria-hidden="true" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      <AlertDialog>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 text-muted-foreground hover:text-destructive"
                                  disabled={deletingEndpoint === endpoint}
                                  aria-label={`Delete /${endpoint}`}
                                >
                                  {deletingEndpoint === endpoint ? (
                                    <Loader2
                                      className="size-4 animate-spin"
                                      aria-hidden="true"
                                    />
                                  ) : (
                                    <Trash2 className="size-4" aria-hidden="true" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete this page?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              You are about to delete{" "}
                              <code className="text-foreground font-mono bg-secondary px-1.5 py-0.5 rounded">
                                /{endpoint}
                              </code>
                              . This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(endpoint)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <PagePreviewDialog
        open={previewPage !== null}
        onOpenChange={(open) => !open && setPreviewPage(null)}
        endpoint={previewPage?.endpoint || ""}
        code={previewPage?.code || ""}
      />
    </>
  );
}
