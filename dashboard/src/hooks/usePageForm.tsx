"use client";

import * as React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { pageSchema, type PageData, type StoredPageData } from "@/lib/models";
import { pagesService } from "@/services/pagesService";

type InputMethod = "code" | "upload";

export function usePageForm(onSuccess?: () => void) {
  const [inputMethod, setInputMethod] = React.useState<InputMethod>("code");
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [originalEndpoint, setOriginalEndpoint] = React.useState<string | null>(null);

  const form = useForm<PageData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      endpoint: "",
      body: "",
      statusCode: 200,
      headers: [],
    },
    mode: "onChange",
  });

  const {
    fields: headerFields,
    append: appendHeader,
    remove: removeHeader,
  } = useFieldArray({
    control: form.control,
    name: "headers",
  });

  const endpoint = form.watch("endpoint");
  const body = form.watch("body");
  const statusCode = form.watch("statusCode");

  const endpointPattern = /^[A-Za-z0-9_\-\/]+$/;
  const isValidEndpoint =
    typeof endpoint === "string" &&
    endpoint.length > 1 &&
    endpoint.length < 100 &&
    endpointPattern.test(endpoint);

  const getEndpointValidationErrors = React.useCallback((): string[] => {
    if (!endpoint || endpoint.length === 0) return [];
    const errors: string[] = [];
    if (endpoint.length <= 1) errors.push("Must be at least 2 characters");
    if (endpoint.length >= 100) errors.push("Must be less than 100 characters");
    if (endpoint.length > 1 && !endpointPattern.test(endpoint))
      errors.push(
        "May only contain letters, numbers, dashes (-), underscores (_) and slashes (/)"
      );
    return errors;
  }, [endpoint, endpointPattern]);

  const endpointErrors = getEndpointValidationErrors();
  const hasContent = (body?.trim().length ?? 0) > 0;
  const canSubmit = isValidEndpoint && hasContent && !isLoading;
  const hasErrors = Object.keys(form.formState.errors).length > 0;

  const statusCodeNum = Number(statusCode);
  const isValidStatusCode =
    Number.isInteger(statusCodeNum) &&
    statusCodeNum >= 100 &&
    statusCodeNum <= 599;

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

  const handleClear = React.useCallback(() => {
    form.reset({ endpoint: "", body: "", statusCode: 200, headers: [] });
    setUploadedFile(null);
    setInputMethod("code");
    setIsEditMode(false);
    setOriginalEndpoint(null);
  }, [form]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    setShowConfirmDialog(false);

    const values = form.getValues();
    const payload: PageData = {
      endpoint: values.endpoint,
      body: values.body || undefined,
      statusCode: values.statusCode,
      headers: values.headers,
    };

    try {
      if (isEditMode) {
        await pagesService.update(payload);
      } else {
        await pagesService.create(payload);
      }
      toast.success(`Page ${isEditMode ? "updated" : "created"} successfully!`, {
        description: `Endpoint: ${values.endpoint}`,
        icon: <CheckCircle2 className="size-4 text-accent" />,
      });
      handleClear();
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

  const onSubmitClick = async () => {
    const isValid = await form.trigger();
    if (isValid) setShowConfirmDialog(true);
  };

  const handleEdit = (ep: string, data: StoredPageData) => {
    setIsEditMode(true);
    setOriginalEndpoint(ep);
    form.reset({
      endpoint: ep,
      body: data.body ?? "",
      statusCode: data.statusCode ?? 200,
      headers: Object.entries(data.headers ?? {}).map(([key, value]) => ({
        key,
        value,
      })),
    });
    setInputMethod("code");
    setUploadedFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyEndpoint = () => {
    navigator.clipboard.writeText(endpoint);
    toast.success("Endpoint copied!");
  };

  return {
    // form instance (for FormProvider / Controller)
    form,

    // field array
    headerFields,
    appendHeader,
    removeHeader,

    // watched values
    endpoint,
    body,
    statusCode,
    statusCodeNum,

    // validation
    isValidEndpoint,
    isValidStatusCode,
    endpointErrors,
    hasContent,
    canSubmit,
    hasErrors,

    // UI state
    inputMethod,
    setInputMethod,
    uploadedFile,
    setUploadedFile,
    isLoading,
    isDragOver,
    showConfirmDialog,
    setShowConfirmDialog,
    isEditMode,
    originalEndpoint,

    // handlers
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleClear,
    handleSubmit,
    onSubmitClick,
    handleEdit,
    copyEndpoint,
  };
}
