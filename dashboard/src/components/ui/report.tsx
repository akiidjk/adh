import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Report } from '@/lib/models';

export function ReportDetails({ report }: { report: Report }) {
  return (
    <div className='space-y-4'>
      {/* Main Report Header */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-3'>
            Security Report
            <Badge variant='secondary' className='ml-auto'>
              {new Date().toLocaleDateString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className='grid gap-4 pt-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <h3 className='font-medium'>Page Information</h3>
              <div className='text-sm'>
                <p className='flex gap-2'>
                  <span className='text-muted-foreground'>URI:</span>
                  <span className='truncate font-mono'>{report.uri || 'N/A'}</span>
                </p>
                <p className='flex gap-2'>
                  <span className='text-muted-foreground'>Referrer:</span>
                  <span className='truncate'>{report.referrer || 'N/A'}</span>
                </p>
                <p className='flex gap-2'>
                  <span className='text-muted-foreground'>Origin:</span>
                  <span>{report.origin || 'N/A'}</span>
                </p>
              </div>
            </div>

            <div className='space-y-2'>
              <h3 className='font-medium'>Environment</h3>
              <div className='text-sm'>
                <p className='flex gap-2'>
                  <span className='text-muted-foreground'>Language:</span>
                  <span>{report.lang || 'N/A'}</span>
                </p>
                <p className='flex gap-2'>
                  <span className='text-muted-foreground'>GPU:</span>
                  <span className='truncate'>{report.gpu || 'N/A'}</span>
                </p>
                <p className='flex gap-2'>
                  <span className='min-w-20 text-muted-foreground'>User Agent:</span>
                  <span className='truncate'>{report.user_agent || 'N/A'}</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Section */}
      {(report.localstorage || report.sessionstorage) && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle>Client Storage</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className='pt-4'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              {report.localstorage && Object.keys(report.localstorage).length > 0 && (
                <div>
                  <h4 className='mb-2 font-medium'>Local Storage</h4>
                  <Table>
                    <TableBody>
                      {Object.entries(report.localstorage).map(([key, value]) => (
                        <TableRow key={`local-${key}`}>
                          <TableCell className='w-[150px] py-2 font-medium'>{key}</TableCell>
                          <TableCell className='py-2 font-mono text-xs break-all'>{value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {report.sessionstorage && Object.keys(report.sessionstorage).length > 0 && (
                <div>
                  <h4 className='mb-2 font-medium'>Session Storage</h4>
                  <Table>
                    <TableBody>
                      {Object.entries(report.sessionstorage).map(([key, value]) => (
                        <TableRow key={`session-${key}`}>
                          <TableCell className='w-[150px] py-2 font-medium'>{key}</TableCell>
                          <TableCell className='py-2 font-mono text-xs break-all'>{value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cookies Section */}
      {report.cookies && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle>Cookies</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className='pt-4'>
            <pre className='overflow-x-auto rounded bg-muted p-3 font-mono text-sm'>
              {report.cookies || 'No cookies found'}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* DOM Section */}
      {report.dom && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle>DOM Snapshot</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className='pt-4'>
            <div className='relative'>
              <pre className='max-h-60 overflow-x-auto rounded bg-muted p-3 font-mono text-xs'>{report.dom}</pre>
              <Badge variant='outline' className='absolute top-2 right-2'>
                {report.dom.length} chars
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Screenshot Preview */}
      {report.screenshot && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle>Screenshot</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className='flex justify-center pt-4'>
            <Image
              src={`data:image/png;base64,${report.screenshot}`}
              alt='Page screenshot'
              className='max-h-96 rounded border shadow-sm'
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
