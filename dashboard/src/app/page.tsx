'use client';

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
import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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

  const handleSearch = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results = await requestService.searchRequests(debouncedQuery);

    if (results.success === false) {
      setSearchResults([]);
      console.error('Invalid search syntax');
      return;
    }

    if (results.total === 0) {
      setSearchResults([]);
      toast.warning('No results found');
      return;
    }

    setSearchResults(results.results);
  }, [debouncedQuery]);

  useEffect(() => {
    if (debouncedQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    handleSearch();
  }, [debouncedQuery, handleSearch]);

  const displayMessages = searchResults.length > 0 ? searchResults : messages;
  const selectedMessage = selectedKey !== null ? displayMessages.find((msg) => msg.key === selectedKey) : null;
  const showLoadingLayer = loading || !isConnected;

  return (
    <>
      {showLoadingLayer && (
        <LoadingOverlay loading={loading} isConnected={isConnected} />
      )}

      <DashboardHeader
        totalCount={displayMessages.length}
        query={query}
        onQueryChange={setQuery}
        onDeleteAll={handleDeleteAll}
      />

      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel defaultSize={25} minSize={25}>
          <ListRequests
            messages={displayMessages}
            loading={loading}
            onDelete={handleDelete}
            onSelect={handleSelect}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          defaultSize={75}
          minSize={25}
          className='dark:bg-gray-700 bg-gray-300 m-4 opacity-90 rounded-lg h-full w-7/12 mt-3 p-4'
        >
          {selectedMessage ? (
            <Details message={selectedMessage} />
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='text-center py-8 text-gray-500'
            >
              Select a request to view details
            </motion.p>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
