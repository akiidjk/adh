'use client';

import { Button } from '@/components/ui/button';
import Details from '@/components/ui/details';
import { Input } from '@/components/ui/input';
import ListRequests from '@/components/ui/list-requests';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDebounce } from '@/hooks/useDebounce';
import { useRequestsHistory } from '@/hooks/useRequestsHistory';
import { useStreamData } from '@/hooks/useStreamData';
import { RequestMessage } from '@/lib/models';
import { requestService } from '@/services/requestService';
import { motion } from 'framer-motion';
import { LogOut, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { logout } from './login/actions';

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

        if (selectedKey === key) {
          setSelectedKey(null);
        }
      } catch (error) {
        updateMessages(() => historyMessages);
        updateStreamMessages(() => streamMessages);
        toast.error(error instanceof Error ? error.message : 'Deletion failed');
      }
    },
    [historyMessages, streamMessages, updateMessages, updateStreamMessages, selectedKey, searchResults]
  );

  const displayMessages = searchResults.length > 0 ? searchResults : messages;

  const selectedMessage = selectedKey !== null ? displayMessages.find((msg) => msg.key === selectedKey) : null;

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

  // Layer for loading and connection status
  const showLoadingLayer = loading || !isConnected;

  return (
    <>
      {showLoadingLayer && (
        <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-background bg-opacity-80'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='flex flex-col items-center gap-4'>
            <Spinner className='w-12 h-12 text-primary' />
            <p className='text-lg font-semibold text-gray-700 dark:text-gray-200'>
              {loading ? 'Loading requests...' : !isConnected ? 'Connecting to stream...' : ''}
            </p>
          </motion.div>
        </div>
      )}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='text-2xl font-bold ml-10 sticky top-0 bg-background z-10 py-4 flex justify-between'>
        <div className='flex gap-3'>Total requests: {displayMessages.length}</div>
        <div className='fixed right-5 top-5 flex gap-3'>
          <div className='flex gap-2'>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search messages'
              className='w-48'
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button size={'icon'} variant={'outline'} onClick={handleDeleteAll}>
                    <Trash2 />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete all messages</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <ModeToggle />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button size={'icon'} variant={'outline'} onClick={logout}>
                    <LogOut />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.h1>
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel defaultSize={25} minSize={25}>
          <ListRequests messages={displayMessages} loading={loading} onDelete={handleDelete} onSelect={handleSelect} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={75}
          minSize={25}
          className='dark:bg-gray-700 bg-gray-300 m-4 opacity-90 rounded-lg h-full w-7/12 mt-3 p-4'>
          {selectedMessage ? (
            <Details message={selectedMessage} />
          ) : (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-center py-8 text-gray-500'>
              Select a request to view details
            </motion.p>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
