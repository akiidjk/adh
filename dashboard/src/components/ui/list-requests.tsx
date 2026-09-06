'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Variants } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RequestMessage } from '@/lib/models';

const cardVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.3, ease: 'easeInOut' }
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
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDelete: (key: string) => Promise<void>;
  onSelect: (key: string) => void;
}

export default function ListRequests({
  messages,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onDelete,
  onSelect
}: ListRequestsProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className='flex flex-col'>
      <ScrollArea className='flex-1'>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex h-20 items-center justify-center gap-2'
          >
            <Loader2 className='animate-spin' />
            <p>Loading requests...</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial='hidden'
            animate='show'
            className='h-[calc(100vh-8rem)] space-y-2 pb-4'
          >
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='py-8 text-center text-gray-500'>
                  No requests found
                </motion.p>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={`${msg.key}-${msg.timestamp}`}
                    variants={cardVariants}
                    initial='initial'
                    animate='animate'
                    exit='exit'
                    whileHover='hover'
                    layout
                  >
                    <Card className='m-3 mr-6'>
                      <CardHeader className='flex flex-row items-start justify-between'>
                        <div>
                          <CardTitle>
                            {msg.address || 'Unknown address'}:{msg.port || 'Unknown port'}
                          </CardTitle>
                        </div>
                        <div className='flex gap-2'>
                          <Badge>{msg.protocol || 'HTTP'}</Badge>
                          <Badge
                            className={
                              msg.method === 'GET'
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : msg.method === 'POST'
                                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                                  : msg.method === 'DELETE'
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : msg.method === 'PUT'
                                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                      : 'bg-gray-500 text-white hover:bg-gray-600'
                            }
                          >
                            {msg.method || 'UNKNOWN'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className='space-y-2'>
                          <p>Path: {truncateText(msg.path, 50)}</p>
                          <p>User Agent: {truncateText(msg.useragent, 50)}</p>
                        </CardDescription>
                      </CardContent>
                      <CardFooter className='flex justify-between gap-3'>
                        <p className='text-sm text-muted-foreground'>{new Date(msg.timestamp).toLocaleString()}</p>
                        <div className='flex gap-3'>
                          <Button variant='destructive' size='sm' onClick={() => onDelete(msg.key)}>
                            Delete
                          </Button>
                          <Button variant='outline' size='sm' onClick={() => onSelect(msg.key)}>
                            Details
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            {hasMore && (
              <Button
                variant='outline'
                className='mx-3 w-[calc(100%-2.25rem)]'
                disabled={loadingMore}
                onClick={onLoadMore}
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </Button>
            )}
          </motion.div>
        )}
      </ScrollArea>
    </div>
  );
}
