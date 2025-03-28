"use client";

import { useMemo, useCallback, useState } from 'react';
import ListRequests from '@/components/ui/list-requests';
import { logout } from './login/actions';
import { useRequestsHistory } from '@/hooks/useRequestsHistory';
import { useStreamData } from '@/hooks/useStreamData';
import { toast } from 'sonner';
import { motion } from "framer-motion";
import { ModeToggle } from '@/components/ui/mode-toggle';
import Details from '@/components/ui/details';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';

export default function Home() {
  const { messages: historyMessages, loading, updateMessages } = useRequestsHistory();
  const { messages: streamMessages, updateMessages: updateStreamMessages } = useStreamData();

  const [selectedKey, setSelectedKey] = useState<number | null>(null);

  const messages = useMemo(() => {
    const combined = [
      ...streamMessages.filter(msg => !historyMessages.some(hm => hm.key === msg.key)),
      ...historyMessages
    ];
    return combined.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [streamMessages, historyMessages]);

  const handleSelect = useCallback((key: number) => {
    setSelectedKey(key);
  }, []);

  const handleDelete = useCallback(async (key: number) => {
    try {
      const isInHistory = historyMessages.some(msg => msg.key === key);
      const isInStream = streamMessages.some(msg => msg.key === key);

      if (isInHistory) updateMessages(prev => prev.filter(msg => msg.key !== key));
      if (isInStream) updateStreamMessages(prev => prev.filter(msg => msg.key !== key));

      const response = await fetch(`/api/delete?id=${key}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete request');

      toast.success("Request deleted successfully");

      if (selectedKey === key) {
        setSelectedKey(null);
      }
    } catch (error) {
      updateMessages(() => historyMessages);
      updateStreamMessages(() => streamMessages);
      toast.error(error instanceof Error ? error.message : 'Deletion failed');
    }
  }, [historyMessages, streamMessages, updateMessages, updateStreamMessages, selectedKey]);

  const selectedMessage = selectedKey !== null
    ? messages.find(msg => msg.key === selectedKey)
    : null;

  return (
    <>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold ml-10 sticky top-0 bg-background z-10 py-4 flex justify-between"
      >
        Total requests: {messages.length}
        <div className="fixed right-5 top-5 flex gap-3">
          <ModeToggle />
          <Button size={'icon'} variant={'outline'} onClick={logout}><LogOut /></Button>
        </div>
      </motion.h1>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={25}>
          <ListRequests
            messages={messages}
            loading={loading}
            onDelete={handleDelete}
            onSelect={handleSelect}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75} minSize={25} className="dark:bg-gray-700 bg-gray-300 m-4 opacity-90 rounded-lg h-full w-7/12 mt-3 p-4">
          {selectedMessage ? (
            <Details message={selectedMessage} />
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500"
            >
              Select a request to view details
            </motion.p>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
      {/* </div> */}
    </>
  );
}
