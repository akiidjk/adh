"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { RequestMessage } from "@/lib/models";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.2 }
  },
  hover: { scale: 1.02 }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface ListRequestsProps {
  messages: RequestMessage[];
  loading: boolean;
  onDelete: (key: number) => Promise<void>;
  onSelect: (key: number) => void;
}

export default function ListRequests({ messages, loading, onDelete, onSelect }: ListRequestsProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };


  return (
    <div className="flex flex-col">
      <ScrollArea className="flex-1">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 justify-center items-center h-20"
          >
            <Loader2 className="animate-spin" />
            <p>Loading requests...</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-2 pb-4 h-[calc(100vh-8rem)]"
          >
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-gray-500"
                >
                  No requests found
                </motion.p>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={`${msg.key}-${msg.timestamp}`}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    whileHover="hover"
                    layout
                  >
                    <Card className="m-3 mr-6">
                      <CardHeader className="flex flex-row justify-between items-start">
                        <div>
                          <CardTitle>{msg.address || 'Unknown address'}:{msg.port || 'Unknown port'}</CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <Badge>{msg.protocol || 'HTTP'}</Badge>
                          <Badge className={
                            msg.method === 'GET' ? 'bg-green-500 hover:bg-green-600 text-white' :
                              msg.method === 'POST' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                                msg.method === 'DELETE' ? 'bg-red-500 hover:bg-red-600 text-white' :
                                  msg.method === 'PUT' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                                    'bg-gray-500 hover:bg-gray-600 text-white'
                          }>
                            {msg.method || 'UNKNOWN'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="space-y-2">
                          <p>Path: {truncateText(msg.path, 50)}</p>
                          <p>User Agent: {truncateText(msg.useragent, 50)}</p>
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="flex justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                        <div className="flex gap-3">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(msg.key)}
                          >
                            Delete
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => onSelect(msg.key)}>
                            Details
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </ScrollArea>
    </div>
  );
}
