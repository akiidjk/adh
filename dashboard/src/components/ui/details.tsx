import { ReportDetails } from '@/components/ui/report';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RequestMessage } from '@/lib/models';
import { motion } from 'framer-motion';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from './button';
import { PrettyRequest } from './pretty-request';

export default function Details({ message }: { message: RequestMessage }) {
  function downloadRawJson() {
    const blob = new Blob([JSON.stringify(message, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'raw_request.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function copyRawJson() {
    navigator.clipboard.writeText(JSON.stringify(message, null, 2));
    toast('Raw JSON copied to clipboard');
  }

  return (
    <>
      <Tabs defaultValue='pretty'>
        <TabsList>
          <TabsTrigger value='pretty'>Pretty data</TabsTrigger>
          <TabsTrigger value='raw'>Raw data</TabsTrigger>
          {message.report.uri != '' && <TabsTrigger value='report'>Report</TabsTrigger>}
        </TabsList>
        <TabsContent value='pretty'>
          <PrettyRequest data={message} />
        </TabsContent>
        <TabsContent value='raw'>
          <div className='fixed flex gap-2 z-10 right-12 mt-3'>
            <Button onClick={() => downloadRawJson()} size={'icon'} className=''>
              <Download />
            </Button>
            <Button onClick={() => copyRawJson()} size={'icon'} className=''>
              <Copy />
            </Button>
          </div>
          <ScrollArea className='h-[calc(100vh-10rem)] rounded-lg'>
            {message ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='h-full overflow-auto'>
                <pre className='whitespace-pre-wrap text-sm bg-background p-4 rounded-lg'>
                  {JSON.stringify(message, null, 2)}
                </pre>
              </motion.div>
            ) : null}
          </ScrollArea>
        </TabsContent>
        <TabsContent value='report'>
          <ReportDetails report={message.report} />
        </TabsContent>
      </Tabs>
    </>
  );
}
