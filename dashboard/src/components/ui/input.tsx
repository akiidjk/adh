'use client';

import { Input as KumoInput } from '@cloudflare/kumo';
import * as React from 'react';

/**
 * Backed by Kumo's Input. All call sites use a separate <Label> and pass only input attributes,
 * so no Field props are passed and Kumo renders a bare, full-width input (Field wrapper is opt-in
 * via `label`/`error`/`description`). ponytail: thin re-export, drop if call sites import Kumo directly.
 */
export type InputProps = React.ComponentProps<typeof KumoInput>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...props }, ref) {
  return <KumoInput ref={ref} className={className} {...props} />;
});

export { Input };
