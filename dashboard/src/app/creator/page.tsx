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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <section aria-labelledby='creator-title'>
      <Header onLogout={logout} />

      <div className='mx-auto w-full max-w-5xl px-4 py-8 md:px-6'>
        <div className='mb-6'>
          <h1 id='creator-title' className='text-2xl font-semibold tracking-tight'>
            Page Creator
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Define an endpoint and the exact HTTP response the webhook serves for it.
          </p>
        </div>

        {hasErrors && (
          <Banner
            variant='error'
            role='alert'
            aria-live='polite'
            className='mb-6'
            title='Fix the following before continuing'
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

        {isEditMode && (
          <Banner
            variant='default'
            className='mb-6'
            description={
              <span>
                Editing{' '}
                <code className='rounded bg-secondary px-1.5 py-0.5 font-mono text-foreground'>
                  /{originalEndpoint}
                </code>
              </span>
            }
            action={
              <Button type='button' variant='ghost' size='sm' onClick={handleClear} className='h-auto gap-2 py-1'>
                <X className='size-4' aria-hidden='true' />
                Cancel edit
              </Button>
            }
          />
        )}

        <Form {...form}>
          <form className='space-y-6' onSubmit={(e) => e.preventDefault()}>
            <Card>
              <CardHeader>
                <CardTitle>Endpoint &amp; status</CardTitle>
                <CardDescription>Where the page is served and the status code it returns.</CardDescription>
              </CardHeader>
              <CardContent className='grid gap-6 lg:grid-cols-2'>
                <EndpointField
                  form={form}
                  isValidEndpoint={isValidEndpoint}
                  endpointErrors={endpointErrors}
                  onCopy={copyEndpoint}
                />
                <StatusCodeField form={form} statusCodeNum={statusCodeNum} isValidStatusCode={isValidStatusCode} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response headers</CardTitle>
                <CardDescription>Optional headers returned with the response.</CardDescription>
              </CardHeader>
              <CardContent>
                <HeadersField form={form} headerFields={headerFields} onAppend={appendHeader} onRemove={removeHeader} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response body</CardTitle>
                <CardDescription>Write the page source or upload a file.</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Sticky action bar keeps the primary action reachable while scrolling a long form. */}
            <div className='sticky bottom-0 -mx-4 border-t border-border bg-background/85 px-4 py-3 backdrop-blur md:-mx-6 md:px-6'>
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
            </div>
          </form>
        </Form>

        <div className='mt-10'>
          <SavedPagesList refreshTrigger={refreshTrigger} onEdit={handleEdit} />
        </div>
      </div>

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
