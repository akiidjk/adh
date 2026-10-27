'use client';

import { Button as KumoButton } from '@cloudflare/kumo';
import * as React from 'react';

/**
 * Thin adapter preserving the shadcn Button API used across the app, backed by Kumo's Button.
 * Icon buttons (size="icon") become Kumo's square shape with the child passed as the `icon`
 * prop; callers already provide aria-label. ponytail: adapter, not a fork — if call sites ever
 * move to `@cloudflare/kumo` Button directly, delete this file.
 */
type LegacyVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
type LegacySize = 'default' | 'sm' | 'icon';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: LegacyVariant;
  size?: LegacySize;
  loading?: boolean;
  title?: React.ReactNode;
};

const VARIANT: Record<LegacyVariant, 'primary' | 'destructive' | 'outline' | 'secondary' | 'ghost'> = {
  default: 'primary',
  destructive: 'destructive',
  outline: 'outline',
  secondary: 'secondary',
  ghost: 'ghost'
};

function Button({ variant = 'default', size = 'default', children, ...props }: ButtonProps) {
  const kumoVariant = VARIANT[variant];
  // Pass children through as children (not Kumo's `icon` prop, which expects a single icon and
  // breaks on multi-child buttons). Icon buttons just get the square shape. A single cast past
  // Kumo's discriminated union keeps the legacy call sites untouched.
  const kumoProps = {
    variant: kumoVariant,
    children,
    ...(size === 'icon' ? { shape: 'square', size: 'base' } : { size: size === 'sm' ? 'sm' : 'base' }),
    ...props
  };
  return <KumoButton {...(kumoProps as React.ComponentProps<typeof KumoButton>)} />;
}

export { Button };
