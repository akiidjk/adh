import { useEffect, useState, useCallback } from "react";
import { RequestMessage } from "@/lib/models";

export function useStreamData() {
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const updateMessages = useCallback((updater: (prev: RequestMessage[]) => RequestMessage[]) => {
    setMessages(updater);
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/api/stream");

    eventSource.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        const key = Object.keys(rawData)[0];
        const newMessage = { key, ...JSON.parse(rawData[key]) };

        setMessages(prev => [newMessage, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to parse stream data'));
        console.error(error)
      }
    };

    eventSource.onerror = () => {
      setError(new Error('EventSource failed'));
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { messages, updateMessages };
}
