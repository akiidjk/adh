'use client';

import { SkeletonLine } from '@cloudflare/kumo';
import { formatDistanceToNow } from 'date-fns';
import { Inbox, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { RequestMessage } from '@/lib/models';
import { cn } from '@/lib/utils';

// Consistent, token-friendly method colors (work in both themes) instead of saturated fills.
const METHOD_COLOR: Record<string, string> = {
  GET: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400',
  POST: 'bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400',
  PUT: 'bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400',
  PATCH: 'bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400',
  DELETE: 'bg-rose-500/10 text-rose-600 ring-rose-500/20 dark:text-rose-400'
};
const methodColor = (m?: string) => METHOD_COLOR[m ?? ''] ?? 'bg-muted text-muted-foreground ring-border';

function relativeTime(ts: string) {
  try {
    return formatDistanceToNow(new Date(ts), { addSuffix: true });
  } catch {
    return '';
  }
}

interface ListRequestsProps {
  messages: RequestMessage[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDelete: (key: string) => Promise<void>;
  onSelect: (key: string) => void;
  selectedKey?: string | null;
}

export default function ListRequests({
  messages,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onDelete,
  onSelect,
  selectedKey
}: ListRequestsProps) {
  if (loading) {
    return (
      <div className='flex flex-col gap-2 p-3' aria-busy='true' aria-label='Loading requests'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='rounded-lg border border-border bg-card p-3'>
            <SkeletonLine minWidth={35} maxWidth={65} />
            <div className='mt-2'>
              <SkeletonLine minWidth={50} maxWidth={85} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className='flex h-[calc(100vh-9rem)] flex-col items-center justify-center gap-3 px-6 text-center'>
        <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
          <Inbox className='size-6 text-muted-foreground' aria-hidden='true' />
        </div>
        <div className='space-y-1'>
          <p className='font-medium'>No requests yet</p>
          <p className='text-sm text-muted-foreground'>Incoming requests appear here in real time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-[calc(100vh-8rem)] overflow-y-auto p-3'>
      <ul className='space-y-1.5'>
        {messages.map((msg) => {
          const selected = msg.key === selectedKey;
          return (
            <li key={`${msg.key}-${msg.timestamp}`}>
              <div
                className={cn(
                  'group relative rounded-lg border transition-colors',
                  selected
                    ? 'border-primary bg-accent/60 ring-1 ring-primary/30'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-accent/30'
                )}
              >
                <button
                  type='button'
                  onClick={() => onSelect(msg.key)}
                  className='block w-full rounded-lg p-3 pr-10 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring'
                >
                  <div className='flex items-center gap-2'>
                    <span
                      className={cn(
                        'inline-flex min-w-[3.25rem] shrink-0 justify-center rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ring-1 ring-inset',
                        methodColor(msg.method)
                      )}
                    >
                      {msg.method || '—'}
                    </span>
                    <span className='flex-1 truncate font-mono text-sm' title={msg.path}>
                      {msg.path || '/'}
                    </span>
                  </div>
                  <div className='mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground'>
                    <span className='truncate'>
                      {msg.address || 'unknown'}
                      {msg.port ? `:${msg.port}` : ''}
                    </span>
                    <span aria-hidden='true'>·</span>
                    <span className='shrink-0' title={new Date(msg.timestamp).toLocaleString()}>
                      {relativeTime(msg.timestamp)}
                    </span>
                  </div>
                </button>
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label='Delete request'
                  onClick={(e) => {
                    e.stopPropagation();
                    void onDelete(msg.key);
                  }}
                  className='absolute top-1.5 right-1.5 size-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100'
                >
                  <Trash2 className='size-3.5' />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      {hasMore && (
        <Button variant='outline' className='mt-2 w-full' disabled={loadingMore} onClick={onLoadMore}>
          {loadingMore ? 'Loading…' : 'Load more'}
        </Button>
      )}
    </div>
  );
}
