import { Copy, Download } from 'lucide-react';

import { ReportDetails } from '@/components/ui/report';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RequestMessage } from '@/lib/models';
import { toast } from '@/lib/toast';

import { Button } from './button';
import { PrettyRequest } from './pretty-request';

export default function Details({ message }: { message: RequestMessage }) {
  const rawJson = JSON.stringify(message, null, 2);

  function downloadRawJson() {
    const blob = new Blob([rawJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'raw_request.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function copyRawJson() {
    navigator.clipboard.writeText(rawJson);
    toast('Raw JSON copied to clipboard');
  }

  const hasReport = Boolean(message.report?.uri);

  return (
    <Tabs defaultValue='pretty' className='flex flex-col gap-4'>
      <TabsList>
        <TabsTrigger value='pretty'>Pretty</TabsTrigger>
        <TabsTrigger value='raw'>Raw</TabsTrigger>
        {hasReport && <TabsTrigger value='report'>Report</TabsTrigger>}
      </TabsList>

      <TabsContent value='pretty'>
        <PrettyRequest data={message} />
      </TabsContent>

      <TabsContent value='raw'>
        <div className='overflow-hidden rounded-lg border border-border'>
          <div className='flex items-center justify-between border-b border-border bg-secondary/40 px-3 py-2'>
            <span className='font-mono text-xs text-muted-foreground'>raw_request.json</span>
            <div className='flex gap-1'>
              <Button
                onClick={downloadRawJson}
                size='icon'
                variant='ghost'
                aria-label='Download raw JSON'
                className='size-7'
              >
                <Download className='size-3.5' />
              </Button>
              <Button onClick={copyRawJson} size='icon' variant='ghost' aria-label='Copy raw JSON' className='size-7'>
                <Copy className='size-3.5' />
              </Button>
            </div>
          </div>
          <pre className='overflow-x-auto bg-card p-4 font-mono text-xs whitespace-pre-wrap'>{rawJson}</pre>
        </div>
      </TabsContent>

      {hasReport && (
        <TabsContent value='report'>
          <ReportDetails report={message.report} />
        </TabsContent>
      )}
    </Tabs>
  );
}
