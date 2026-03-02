"use client";

import * as React from "react";
import { AlertCircle, Info, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Header } from "@/components/header";
import { SavedPagesList } from "@/components/saved-pages-list";
import { EndpointField } from "@/components/creator/endpoint-field";
import { StatusCodeField } from "@/components/creator/status-code-field";
import { HeadersField } from "@/components/creator/headers-field";
import { ContentField } from "@/components/creator/content-field";
import { FormActions } from "@/components/creator/form-actions";
import { ConfirmDialog } from "@/components/creator/confirm-dialog";
import { usePageForm } from "@/hooks/usePageForm";
import { logout } from "../login/actions";

export default function PageCreator() {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const {
    form,
    headerFields,
    appendHeader,
    removeHeader,
    endpoint,
    body,
    statusCodeNum,
    isValidEndpoint,
    isValidStatusCode,
    endpointErrors,
    hasContent,
    canSubmit,
    hasErrors,
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
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleClear,
    handleSubmit,
    onSubmitClick,
    handleEdit,
    copyEndpoint,
  } = usePageForm(() => setRefreshTrigger((n) => n + 1));

  return (
    <section aria-labelledby="page-creator-title">
      <Header title="Page Creator" showModeToggle onLogout={logout} />

      {/* Error summary */}
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
            {/* Edit mode banner */}
            {isEditMode && (
              <Alert className="border-blue-500 bg-blue-500/10">
                <Info className="size-4 text-blue-500" aria-hidden="true" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Editing page:{" "}
                    <code className="font-mono text-foreground bg-secondary px-1.5 py-0.5 rounded">
                      /{originalEndpoint}
                    </code>
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

            <EndpointField
              form={form}
              isValidEndpoint={isValidEndpoint}
              endpointErrors={endpointErrors}
              onCopy={copyEndpoint}
            />

            <StatusCodeField
              form={form}
              statusCodeNum={statusCodeNum}
              isValidStatusCode={isValidStatusCode}
            />

            <HeadersField
              form={form}
              headerFields={headerFields}
              onAppend={appendHeader}
              onRemove={removeHeader}
            />

            <ContentField
              form={form}
              inputMethod={inputMethod}
              onInputMethodChange={setInputMethod}
              uploadedFile={uploadedFile}
              onUploadedFileClear={() => {
                setUploadedFile(null);
                form.setValue("body", "", { shouldValidate: true });
              }}
              isDragOver={isDragOver}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onFileSelect={handleFileSelect}
              onSave={onSubmitClick}
            />

            <FormActions
              isLoading={isLoading}
              isEditMode={isEditMode}
              canSubmit={canSubmit}
              isValidEndpoint={isValidEndpoint}
              hasContent={hasContent}
              hasAnything={!!(endpoint || body || uploadedFile)}
              onReset={handleClear}
              onSubmit={onSubmitClick}
            />
          </form>
        </Form>

        {/* Saved pages list */}
        <div className="pt-8 border-t border-border">
          <SavedPagesList refreshTrigger={refreshTrigger} onEdit={handleEdit} />
        </div>
      </div>

      {/* Submission confirmation dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        isEditMode={isEditMode}
        endpoint={endpoint}
        statusCodeNum={statusCodeNum}
        headerFields={headerFields}
        headers={form.getValues("headers")}
        inputMethod={inputMethod}
        uploadedFileName={uploadedFile?.name}
        bodyLength={body?.length ?? 0}
        onConfirm={handleSubmit}
      />
    </section>
  );
}
