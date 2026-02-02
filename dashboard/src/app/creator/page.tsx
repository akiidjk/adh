"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Code2,
  Upload,
  Trash2,
  Send,
  FileCode,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CodeEditor } from "@/components/code-editor";
import { SavedPagesList } from "@/components/saved-pages-list";
import { pageSchema, type PageData } from "@/lib/models";
import { Header } from "@/components/header";
import { logout } from "../login/actions";

type InputMethod = "code" | "upload";

interface PageCreatorProps {
  onSuccess?: () => void;
}

export default function PageCreator({ onSuccess }: PageCreatorProps) {
  const [inputMethod, setInputMethod] = React.useState<InputMethod>("code");
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [originalEndpoint, setOriginalEndpoint] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<PageData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      endpoint: "",
      body: "",
    },
    mode: "onChange",
  });

  const endpoint = form.watch("endpoint");
  const body = form.watch("body");

  const endpointPattern = /^[A-Za-z0-9_\-\/]+$/;
  const isValidEndpoint =
    typeof endpoint === "string" &&
    endpoint.length > 1 &&
    endpoint.length < 100 &&
    endpointPattern.test(endpoint);

  const getEndpointValidationErrors = React.useCallback((): string[] => {
    if (!endpoint || endpoint.length === 0) return [];

    const errors: string[] = [];

    if (endpoint.length <= 1) {
      errors.push("Must be at least 2 characters");
    }
    if (endpoint.length >= 100) {
      errors.push("Must be less than 100 characters");
    }
    if (endpoint.length > 1 && !endpointPattern.test(endpoint)) {
      errors.push("May only contain letters, numbers, dashes (-), underscores (_) and slashes (/)");
    }

    return errors;
  }, [endpoint, endpointPattern]);

  const endpointErrors = getEndpointValidationErrors();
  const hasContent = (body?.trim().length ?? 0) > 0;
  const canSubmit = isValidEndpoint && hasContent && !isLoading;

  const handleFileSelect = React.useCallback(
    (file: File) => {
      const validExtensions = [".tsx", ".ts", ".jsx", ".js", ".html", ".css"];
      const extension = file.name.substring(file.name.lastIndexOf("."));

      if (!validExtensions.includes(extension)) {
        toast.error("Unsupported format", {
          description: "Accepted formats: .tsx, .ts, .jsx, .js, .html, .css",
        });
        return;
      }

      setUploadedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        form.setValue("body", content, { shouldValidate: true });
      };
      reader.readAsText(file);

      toast.success("File uploaded", {
        description: `${file.name} ready to submit`,
      });
    },
    [form]
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClear = () => {
    form.reset();
    setUploadedFile(null);
    setInputMethod("code");
    setIsEditMode(false);
    setOriginalEndpoint(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    setShowConfirmDialog(false);

    const values = form.getValues();
    const payload: PageData = {
      endpoint: values.endpoint,
      body: values.body || undefined,
    };

    try {
      const response = await fetch("/api/create", {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error ${isEditMode ? "updating" : "creating"} page`);
      }

      toast.success(`Page ${isEditMode ? "updated" : "created"} successfully!`, {
        description: `Endpoint: ${values.endpoint}`,
        icon: <CheckCircle2 className="size-4 text-accent" />,
      });

      handleClear();
      setRefreshTrigger((prev) => prev + 1);
      onSuccess?.();
    } catch (error) {
      toast.error(`Error ${isEditMode ? "updating" : "creating"} page`, {
        description:
          error instanceof Error ? error.message : "Please try again later",
        icon: <AlertCircle className="size-4" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyEndpoint = () => {
    navigator.clipboard.writeText(endpoint);
    toast.success("Endpoint copied!");
  };

  const onSubmitClick = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setShowConfirmDialog(true);
    }
  };

  const handleEdit = (endpoint: string, code: string) => {
    setIsEditMode(true);
    setOriginalEndpoint(endpoint);
    form.setValue("endpoint", endpoint, { shouldValidate: true });
    form.setValue("body", code, { shouldValidate: true });
    setInputMethod("code");
    setUploadedFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasErrors = Object.keys(form.formState.errors).length > 0;

  return (
    <section className="" aria-labelledby="page-creator-title">
      {/* Header */}
      <Header
        title="Page Creator"
        showModeToggle={true}
        onLogout={logout}
      />
      {/* Error Summary */}
      {hasErrors && (
        <Alert variant="destructive" role="alert" aria-live="polite">
          <AlertCircle className="size-4" aria-hidden="true" />
          <AlertDescription>
            <span className="font-medium">
              Fix the following errors before continuing:
            </span>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <li key={field}>
                  <span className="font-medium capitalize">{field}:</span>{" "}
                  {error?.message as string}
                </li>
              ))}
              {!hasContent && inputMethod === "code" && (
                <li>
                  <span className="font-medium">Content:</span> Enter the page
                  code
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="p-8 space-y-8">
        <Form {...form}>
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Edit Mode Indicator */}
            {isEditMode && (
              <Alert className="border-blue-500 bg-blue-500/10">
                <Info className="size-4 text-blue-500" aria-hidden="true" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Editing page: <code className="font-mono text-foreground bg-secondary px-1.5 py-0.5 rounded">/{originalEndpoint}</code>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="gap-2 h-auto py-1"
                  >
                    <X className="size-4" aria-hidden="true" />
                    Cancel Edit
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Endpoint Field */}
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
                            <li>• Must start with /</li>
                            <li>• Length: 2-99 characters</li>
                            <li>• Only letters, numbers, -, _ and /</li>
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
                              <TooltipContent side="top" className="max-w-xs" role="alert">
                                <p className="font-medium text-destructive">Validation errors:</p>
                                <ul className="mt-1 space-y-0.5 text-xs">
                                  {endpointErrors.map((error, index) => (
                                    <li key={index} className="flex items-start gap-1.5">
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
                                onClick={copyEndpoint}
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

            {/* Content Field */}
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Content</FormLabel>

                  <Tabs
                    value={inputMethod}
                    onValueChange={(v) => setInputMethod(v as InputMethod)}
                    className="w-full"
                  >
                    <TabsList variant={"line"} className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="code"
                        className="gap-2"
                      >
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

                    <TabsContent value="code" className="mt-4">
                      <FormControl>
                        <CodeEditor
                          value={field.value || ""}
                          onChange={(value) =>
                            form.setValue("body", value, { shouldValidate: true })
                          }
                          placeholder={`// Enter your page code here...\n\nexport default function Page() {\n  return (\n    <div>\n      Hello World!\n    </div>\n  );\n}`}
                          minHeight="350px"
                        />
                      </FormControl>
                      {body && (
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{body.split("\n").length} lines</span>
                          <span>{body.length} characters</span>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="upload" className="mt-4">
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            fileInputRef.current?.click();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Click or drag to upload a file"
                        className={`
                        relative flex min-h-[350px] cursor-pointer flex-col items-center justify-center gap-4
                        rounded-lg border-2 border-dashed transition-all duration-200
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                        ${isDragOver
                            ? "border-accent bg-accent/10"
                            : "border-border bg-input hover:border-muted-foreground hover:bg-secondary/50"
                          }
                      `}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=""
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file);
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
                                setUploadedFile(null);
                                form.setValue("body", "", { shouldValidate: true });
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

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 border-border text-muted-foreground hover:text-foreground bg-transparent"
                    disabled={!endpoint && !body && !uploadedFile}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to reset?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear all data entered in the form. You won't be
                      able to recover your changes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClear}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Confirm Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex-1">
                      <Button
                        type="button"
                        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={!canSubmit}
                        onClick={onSubmitClick}
                      >
                        {isLoading ? (
                          <>
                            <Loader2
                              className="size-4 animate-spin"
                              aria-hidden="true"
                            />
                            {isEditMode ? "Updating..." : "Creating..."}
                          </>
                        ) : (
                          <>
                            <Send className="size-4" aria-hidden="true" />
                            {isEditMode ? "Update Page" : "Create Page"}
                          </>
                        )}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!canSubmit && (
                    <TooltipContent>
                      {!isValidEndpoint &&
                        "Enter a valid endpoint (e.g.: /about)"}
                      {isValidEndpoint &&
                        !hasContent &&
                        "Enter code or upload a file"}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </form>
        </Form>

        {/* Saved Pages Section */}
        <div className="pt-8 border-t border-border">
          <SavedPagesList refreshTrigger={refreshTrigger} onEdit={handleEdit} />
        </div>

      </div>


      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
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
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Endpoint:</span>
                    <code className="rounded bg-input px-2 py-0.5 font-mono text-foreground">
                      {endpoint}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Source:</span>
                    <span className="text-foreground">
                      {inputMethod === "code"
                        ? "Code editor"
                        : uploadedFile?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="text-foreground">
                      {body?.length || 0} characters
                    </span>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              {isEditMode ? "Confirm and Update" : "Confirm and Create"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
