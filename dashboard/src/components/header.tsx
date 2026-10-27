'use client';

import { LogOut, Webhook } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  showNav?: boolean;
  showModeToggle?: boolean;
  onLogout?: () => void | Promise<void>;
}

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/creator', label: 'Creator' }
];

export function Header({
  leftContent,
  centerContent,
  rightContent,
  showNav = true,
  showModeToggle = true,
  onLogout
}: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className='sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-14 items-center gap-3 px-4 md:px-6'>
        {/* Brand */}
        <Link href='/' className='flex items-center gap-2' aria-label='ADH home'>
          <span className='flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm'>
            <Webhook className='size-[18px]' aria-hidden='true' />
          </span>
          <span className='hidden text-sm font-semibold tracking-tight sm:inline'>ADH</span>
        </Link>

        {/* Primary nav */}
        {showNav && (
          <nav className='ml-1 flex items-center gap-1'>
            {NAV_ITEMS.map((item) => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {leftContent && <div className='hidden items-center gap-2 lg:flex'>{leftContent}</div>}

        {centerContent ? (
          <div className='flex min-w-0 flex-1 items-center justify-center'>{centerContent}</div>
        ) : (
          <div className='flex-1' />
        )}

        {/* Right cluster */}
        <div className='flex shrink-0 items-center gap-2'>
          {rightContent}
          {showModeToggle && <ModeToggle />}
          {onLogout && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size='icon' variant='ghost' onClick={() => void onLogout()} aria-label='Log out'>
                    <LogOut className='size-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Log out</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </header>
  );
}
