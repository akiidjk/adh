'use client';

import { Banner } from '@cloudflare/kumo';
import { X } from 'lucide-react';
import * as React from 'react';

import { ConfirmDialog } from '@/components/creator/confirm-dialog';
import { ContentField } from '@/components/creator/content-field';
import { EndpointField } from '@/components/creator/endpoint-field';
import { FormActions } from '@/components/creator/form-actions';
import { HeadersField } from '@/components/creator/headers-field';
import { StatusCodeField } from '@/components/creator/status-code-field';
import { Header } from '@/components/header';
import { SavedPagesList } from '@/components/saved-pages-list';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { usePageForm } from '@/hooks/usePageForm';

import { logout } from '../login/actions';

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
    copyEndpoint
  } = usePageForm(() => setRefreshTrigger((n) => n + 1));

  return (
    <section aria-labelledby='page-creator-title'>
      <Header title='Page Creator' showModeToggle onLogout={logout} />

      {/* Error summary */}
      {hasErrors && (
        <Banner
          variant='error'
          role='alert'
          aria-live='polite'
          title='Fix the following errors before continuing:'
          description={
            <ul className='mt-2 list-inside list-disc space-y-1'>
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <li key={field}>
                  <span className='font-medium capitalize'>{field}:</span> {error?.message as string}
                </li>
              ))}
              {!hasContent && inputMethod === 'code' && (
                <li>
                  <span className='font-medium'>Content:</span> Enter the page code
                </li>
              )}
            </ul>
          }
        />
      )}

      <div className='space-y-8 p-8'>
        <Form {...form}>
          <form className='space-y-6' onSubmit={(e) => e.preventDefault()}>
            {/* Edit mode banner */}
            {isEditMode && (
              <Banner
                variant='default'
                description={
                  <span>
                    Editing page:{' '}
                    <code className='rounded bg-secondary px-1.5 py-0.5 font-mono text-foreground'>
                      /{originalEndpoint}
                    </code>
                  </span>
                }
                action={
                  <Button type='button' variant='ghost' size='sm' onClick={handleClear} className='h-auto gap-2 py-1'>
                    <X className='size-4' aria-hidden='true' />
                    Cancel Edit
                  </Button>
                }
              />
            )}

            <EndpointField
              form={form}
              isValidEndpoint={isValidEndpoint}
              endpointErrors={endpointErrors}
              onCopy={copyEndpoint}
            />

            <StatusCodeField form={form} statusCodeNum={statusCodeNum} isValidStatusCode={isValidStatusCode} />

            <HeadersField form={form} headerFields={headerFields} onAppend={appendHeader} onRemove={removeHeader} />

            <ContentField
              form={form}
              inputMethod={inputMethod}
              onInputMethodChange={setInputMethod}
              uploadedFile={uploadedFile}
              onUploadedFileClear={() => {
                setUploadedFile(null);
                form.setValue('body', '', { shouldValidate: true });
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
        <div className='border-t border-border pt-8'>
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
        headers={form.getValues('headers')}
        inputMethod={inputMethod}
        uploadedFileName={uploadedFile?.name}
        bodyLength={body?.length ?? 0}
        onConfirm={handleSubmit}
      />
    </section>
  );
}
