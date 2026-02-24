"use client";

import * as React from "react";
import useSWR from "swr";
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
  Hash,
  Tags,
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
import type { StoredPageData } from "@/lib/models";

type PagesData = Record<string, StoredPageData>;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function getStatusCodeColor(code: number): string {
  if (code >= 200 && code < 300) return "text-emerald-500";
  if (code >= 300 && code < 400) return "text-blue-400";
  if (code >= 400 && code < 500) return "text-amber-500";
  if (code >= 500) return "text-destructive";
  return "text-muted-foreground";
}

function getStatusCodeBadgeClass(code: number): string {
  if (code >= 200 && code < 300)
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (code >= 300 && code < 400)
    return "bg-blue-400/10 text-blue-400 border-blue-400/20";
  if (code >= 400 && code < 500)
    return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  if (code >= 500)
    return "bg-destructive/10 text-destructive border-destructive/20";
  return "bg-secondary text-muted-foreground";
}

export interface SavedPagesListProps {
  refreshTrigger?: number;
  onEdit?: (endpoint: string, data: StoredPageData) => void;
}

export function SavedPagesList({
  refreshTrigger,
  onEdit,
}: SavedPagesListProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [deletingEndpoint, setDeletingEndpoint] = React.useState<string | null>(
    null
  );
  const [previewPage, setPreviewPage] = React.useState<{
    endpoint: string;
    code: string;
  } | null>(null);

  const {
    data,
    error,
    isValidating,
    isLoading,
    mutate: refreshData,
  } = useSWR<PagesData>("/api/create", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
  });

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
                <FolderOpen
                  className="size-5 text-accent"
                  aria-hidden="true"
                />
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
                {pages.map(([endpoint, pageData]) => {
                  const bodyLength = pageData.body?.length ?? 0;
                  const headersCount = Object.keys(pageData.headers ?? {}).length;
                  const statusCode = pageData.statusCode ?? 200;

                  return (
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
                        <div className="min-w-0 space-y-1">
                          <code className="text-sm font-mono text-foreground truncate block">
                            /{endpoint}
                          </code>
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Status code badge */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className={`inline-flex items-center gap-1 text-xs font-mono px-1.5 py-0.5 rounded border ${getStatusCodeBadgeClass(statusCode)}`}
                                  >
                                    <Hash
                                      className="size-2.5"
                                      aria-hidden="true"
                                    />
                                    {statusCode}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  HTTP status code
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* Body size */}
                            <span className="text-xs text-muted-foreground">
                              {bodyLength} chars
                            </span>

                            {/* Headers count */}
                            {headersCount > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground cursor-help">
                                      <Tags
                                        className="size-3"
                                        aria-hidden="true"
                                      />
                                      {headersCount}{" "}
                                      {headersCount === 1
                                        ? "header"
                                        : "headers"}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="bottom"
                                    className="max-w-xs"
                                  >
                                    <p className="font-medium mb-1">
                                      Custom headers
                                    </p>
                                    <ul className="space-y-0.5">
                                      {Object.entries(pageData.headers ?? {}).map(([key, value], i) => (
                                        <li
                                          key={i}
                                          className="text-xs font-mono"
                                        >
                                          <span className="text-accent">
                                            {key}
                                          </span>
                                          <span className="text-muted-foreground">
                                            :{" "}
                                          </span>
                                          <span>{value}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
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
                                  setPreviewPage({
                                    endpoint,
                                    code: pageData.body ?? "",
                                  })
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
                                  onClick={() => onEdit(endpoint, pageData)}
                                  aria-label={`Edit /${endpoint}`}
                                >
                                  <Edit
                                    className="size-4"
                                    aria-hidden="true"
                                  />
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
                                      <Trash2
                                        className="size-4"
                                        aria-hidden="true"
                                      />
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
                  );
                })}
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
