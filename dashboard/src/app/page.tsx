'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { LoadingOverlay } from '@/components/dashboard/loading-overlay';
import Details from '@/components/ui/details';
import ListRequests from '@/components/ui/list-requests';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useDebounce } from '@/hooks/useDebounce';
import { useRequestsHistory } from '@/hooks/useRequestsHistory';
import { useStreamData } from '@/hooks/useStreamData';
import { RequestMessage } from '@/lib/models';
import { requestService } from '@/services/requestService';

export default function Home() {
  const { messages: historyMessages, loading, updateMessages } = useRequestsHistory();
  const { messages: streamMessages, updateMessages: updateStreamMessages, isConnected } = useStreamData();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const [selectedKey, setSelectedKey] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<RequestMessage[]>([]);

  const messages = useMemo(() => {
    const combined = [
      ...streamMessages.filter((msg) => !historyMessages.some((hm) => hm.key === msg.key)),
      ...historyMessages
    ];
    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [streamMessages, historyMessages]);

  const handleSelect = useCallback((key: number) => {
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
    async (key: number) => {
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
    if (!debouncedQuery.trim()) return;

    let active = true;
    const search = async () => {
      const results = await requestService.searchRequests(debouncedQuery);
      if (!active) return;

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

    void search();
    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const displayMessages = query.trim() && searchResults.length > 0 ? searchResults : messages;
  const selectedMessage = selectedKey !== null ? displayMessages.find((msg) => msg.key === selectedKey) : null;
  const showLoadingLayer = loading || !isConnected;

  return (
    <>
      {showLoadingLayer && <LoadingOverlay loading={loading} isConnected={isConnected} />}

      <DashboardHeader
        totalCount={displayMessages.length}
        query={query}
        onQueryChange={setQuery}
        onDeleteAll={handleDeleteAll}
      />

      <ResizablePanelGroup orientation='horizontal'>
        <ResizablePanel defaultSize={25} minSize={25}>
          <ListRequests messages={displayMessages} loading={loading} onDelete={handleDelete} onSelect={handleSelect} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          defaultSize={75}
          minSize={25}
          className='m-4 mt-3 h-full w-7/12 rounded-lg bg-gray-300 p-4 opacity-90 dark:bg-gray-700'
        >
          {selectedMessage ? (
            <Details message={selectedMessage} />
          ) : (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='py-8 text-center text-gray-500'>
              Select a request to view details
            </motion.p>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
