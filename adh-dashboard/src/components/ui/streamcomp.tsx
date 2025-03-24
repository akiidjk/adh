"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function StreamComponent() {
  const [messages, setMessages] = useState<string[]>([]);

  // Funzione per ottenere la cronologia
  async function getHistory() {
    try {
      const res = await fetch("/api/history");
      if (!res.ok) throw new Error("Errore nel recupero della cronologia");
      const history = await res.json();
      console.log(history.data)
      setMessages(history.data); // Aggiorna lo stato con i dati storici
    } catch (error) {
      console.error("Errore nel caricamento della cronologia:", error);
    }
  }

  useEffect(() => {
    getHistory();
    console.log("Start stream")
    const eventSource = new EventSource("/api/stream");

    eventSource.onmessage = (event) => {
      console.log("Nuovo messaggio:", event.data);
      setMessages((prev) => [...prev, event.data]); // Aggiorna la lista con nuovi dati
    };

    eventSource.onerror = () => {
      console.error("Errore nello stream");
      eventSource.close();
    };

    return () => eventSource.close(); // Cleanup al dismount
  }, []);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Live Data Stream</h2>

      <ScrollArea className="h-full border border-gray-700 rounded-lg p-2">
        <div className="space-y-2">
          {messages.map((msg, index) => (
            <Card key={index} className="bg-gray-800 text-white">
              <CardContent className="p-4">{JSON.stringify(msg)}</CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
