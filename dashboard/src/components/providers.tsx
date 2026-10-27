'use client';

import { ToastProvider } from '@cloudflare/kumo';
import * as React from 'react';

import { toastManager } from '@/lib/toast';

// Client boundary for Kumo's ToastProvider: the toast manager is a non-serializable object, so
// it can't be passed from the (server) root layout — it's wired up here inside the client tree.
export function KumoProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider toastManager={toastManager}>{children}</ToastProvider>;
}
