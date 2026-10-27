import { createKumoToastManager } from '@cloudflare/kumo';
import type { ReactNode } from 'react';

/**
 * Module-scope Kumo toast manager + a sonner-compatible `toast` shim, so call sites keep the
 * familiar `toast.success(message, { description })` / `toast(message)` ergonomics while
 * rendering Kumo toasts. The manager is rendered by <KumoProviders> (components/providers.tsx).
 */
export const toastManager = createKumoToastManager();

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
// `icon` is accepted for sonner call-site compatibility but ignored: Kumo renders a variant icon.
type ToastOptions = { description?: ReactNode; icon?: ReactNode };

function emit(variant: ToastVariant) {
  return (title: ReactNode, options?: ToastOptions) =>
    toastManager.add({ variant, title, description: options?.description });
}

export const toast = Object.assign(emit('default'), {
  success: emit('success'),
  error: emit('error'),
  warning: emit('warning'),
  info: emit('info'),
  message: emit('default')
});
