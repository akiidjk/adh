import { RequestMessage } from '@/lib/models';
import { useCallback, useEffect, useState } from 'react';

export function useRequestsHistory() {
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const updateMessages = useCallback((updater: (prev: RequestMessage[]) => RequestMessage[]) => {
    setMessages(updater);
  }, []);

  useEffect(() => {
    async function getHistory() {
      try {
        const res = await fetch('/api/history');
        if (!res.ok) throw new Error('Failed to fetch history');
        const history = await res.json();
        const parsedData = history.data.map((entry: Record<string, object>) => {
          const key = parseInt(Object.keys(entry)[0]);

          return { key, ...entry[key] };
        });

        const sortedData = parsedData.sort(
          (a: RequestMessage, b: RequestMessage) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setMessages(sortedData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error loading history:', err);
      } finally {
        setLoading(false);
      }
    }

    getHistory();
  }, []);

  return { messages, loading, error, updateMessages };
}
