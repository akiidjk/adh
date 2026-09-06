import { useCallback, useEffect, useState } from 'react';

import { RequestMessage } from '@/lib/models';

const PAGE_SIZE = 50;

async function fetchHistory(offset: number) {
  const response = await fetch(`/api/history?limit=${PAGE_SIZE}&offset=${offset}`);
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
}

export function useRequestsHistory() {
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateMessages = useCallback((updater: (prev: RequestMessage[]) => RequestMessage[]) => {
    setMessages(updater);
  }, []);

  useEffect(() => {
    let active = true;
    fetchHistory(0)
      .then((history) => {
        if (!active) return;
        setTotal(history.request_number);
        setMessages(history.data.slice(0, 500));
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error loading history:', err);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const history = await fetchHistory(messages.length);
      setTotal(history.request_number);
      setMessages((previous) => [...previous, ...history.data].slice(0, 500));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoadingMore(false);
    }
  }, [messages.length]);

  return {
    messages,
    loading,
    loadingMore,
    error,
    updateMessages,
    loadMore,
    hasMore: messages.length < Math.min(total, 500)
  };
}
