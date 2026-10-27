'use client';

import { MousePointerClick } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import Details from '@/components/ui/details';
import ListRequests from '@/components/ui/list-requests';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useDebounce } from '@/hooks/useDebounce';
import { useRequestsHistory } from '@/hooks/useRequestsHistory';
import { useStreamData } from '@/hooks/useStreamData';
import { RequestMessage } from '@/lib/models';
import { toast } from '@/lib/toast';
import { requestService } from '@/services/requestService';

export default function Home() {
  const { messages: historyMessages, loading, loadingMore, updateMessages, loadMore, hasMore } = useRequestsHistory();
  const { messages: streamMessages, updateMessages: updateStreamMessages, isConnected } = useStreamData();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<RequestMessage[]>([]);

  const messages = useMemo(() => {
    const combined = new Map(historyMessages.map((message) => [message.key, message]));
    for (const message of streamMessages) combined.set(message.key, message);
    return [...combined.values()].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [streamMessages, historyMessages]);

  const handleSelect = useCallback((key: string) => {
    setSelectedKey(key);
  }, []);

  const handleDeleteAll = useCallback(async () => {
    try {
      await requestService.deleteAllRequests();
      updateMessages(() => []);
      updateStreamMessages(() => []);
      toast.success('All requests deleted successfully');
    } catch {
      toast.error('Failed to delete requests');
    }
  }, [updateMessages, updateStreamMessages]);

  const handleDelete = useCallback(
    async (key: string) => {
      try {
        const isInHistory = historyMessages.some((msg) => msg.key === key);
        const isInStream = streamMessages.some((msg) => msg.key === key);
        const isInSearchResult = searchResults.some((msg) => msg.key === key);

        if (isInHistory) updateMessages((prev) => prev.filter((msg) => msg.key !== key));
        if (isInStream) updateStreamMessages((prev) => prev.filter((msg) => msg.key !== key));
        if (isInSearchResult) setSearchResults((prev) => prev.filter((msg) => msg.key !== key));

        await requestService.deleteRequest(key);
        toast.success('Request deleted successfully');

        if (selectedKey === key) setSelectedKey(null);
      } catch (error) {
        updateMessages(() => historyMessages);
        updateStreamMessages(() => streamMessages);
        toast.error(error instanceof Error ? error.message : 'Deletion failed');
      }
    },
    [historyMessages, streamMessages, updateMessages, updateStreamMessages, selectedKey, searchResults]
  );

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      return;
    }

    const controller = new AbortController();
    const search = async () => {
      const results = await requestService.searchRequests(debouncedQuery, controller.signal);

      if (results.success === false) {
        setSearchResults([]);
        console.error('Invalid search syntax');
      } else if (results.total === 0) {
        setSearchResults([]);
        toast.warning('No results found');
      } else {
        setSearchResults(results.results);
      }
    };

    void search().catch((error) => {
      if (error instanceof Error && error.name !== 'AbortError') toast.error(error.message);
    });
    return () => controller.abort();
  }, [debouncedQuery]);

  const displayMessages = query.trim() ? searchResults : messages;
  const selectedMessage = selectedKey !== null ? displayMessages.find((msg) => msg.key === selectedKey) : null;

  return (
    <>
      <DashboardHeader
        totalCount={displayMessages.length}
        isConnected={isConnected}
        query={query}
        onQueryChange={setQuery}
        onDeleteAll={handleDeleteAll}
      />

      <ResizablePanelGroup orientation='horizontal'>
        <ResizablePanel defaultSize={25} minSize={25}>
          <ListRequests
            messages={displayMessages}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={!query.trim() && hasMore}
            onLoadMore={loadMore}
            onDelete={handleDelete}
            onSelect={handleSelect}
            selectedKey={selectedKey}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={75} minSize={30} className='p-3'>
          <div className='h-[calc(100vh-8rem)] overflow-y-auto rounded-lg border border-border bg-card p-5'>
            {selectedMessage ? (
              <Details message={selectedMessage} />
            ) : (
              <div className='flex h-full flex-col items-center justify-center gap-3 text-center'>
                <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
                  <MousePointerClick className='size-6 text-muted-foreground' aria-hidden='true' />
                </div>
                <div className='space-y-1'>
                  <p className='font-medium'>No request selected</p>
                  <p className='text-sm text-muted-foreground'>Pick a request on the left to inspect its details.</p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
