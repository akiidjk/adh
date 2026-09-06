'use client';
import { useCallback, useEffect, useState } from 'react';

import { RequestMessage } from '@/lib/models';

export function useStreamData() {
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const updateMessages = useCallback((updater: (prev: RequestMessage[]) => RequestMessage[]) => {
    setMessages(updater);
  }, []);

  useEffect(() => {
    const eventSource = new EventSource('/api/stream');

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const newMessage = JSON.parse(event.data) as RequestMessage;
        setMessages((prev) => [newMessage, ...prev.filter((message) => message.key !== newMessage.key)].slice(0, 500));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to parse stream data'));
        console.error('Stream parsing error:', err);
      }
    };

    eventSource.onerror = () => {
      setError(new Error('EventSource failed'));
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { messages, updateMessages, error, isConnected };
}
