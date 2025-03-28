"use client";
import { useEffect, useState, useCallback } from "react";
import { RequestMessage } from "@/lib/models";

export function useStreamData() {
  const [messages, setMessages] = useState<RequestMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  let retryDelay = 1000;

  const updateMessages = useCallback((updater: (prev: RequestMessage[]) => RequestMessage[]) => {
    setMessages(updater);
  }, []);

  useEffect(() => {
    let lastID = sessionStorage.getItem("lastID") || "$";
    let eventSource: EventSource | null = null;

    const connect = () => {
      eventSource = new EventSource(`/api/stream?lastID=${lastID}`);

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        retryDelay = 1000;
      };

      eventSource.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);
          const key = Object.keys(rawData)[0];
          const newMessage = { key, ...JSON.parse(rawData[key]) };

          setMessages(prev => [newMessage, ...prev]);
          lastID = key;
          sessionStorage.setItem("lastID", lastID);
        } catch (err) {
          setError(err instanceof Error ? err : new Error("Failed to parse stream data"));
          console.error("Stream parsing error:", err);
        }
      };

      eventSource.onerror = () => {
        setError(new Error("EventSource failed"));
        setIsConnected(false);
        eventSource?.close();
        setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30000); // Backoff max 30s
      };
    };

    connect();

    return () => {
      eventSource?.close();
    };
  }, []);

  return { messages, updateMessages, error, isConnected };
}
