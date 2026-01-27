import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Report } from '@/lib/models';
import Image from 'next/image';

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
        <CardContent className='pt-4 grid gap-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <h3 className='font-medium'>Page Information</h3>
              <div className='text-sm'>
                <p className='flex gap-2'>
                  <span className='text-muted-foreground'>URI:</span>
                  <span className='font-mono truncate'>{report.uri || 'N/A'}</span>
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
                  <span className='text-muted-foreground min-w-20'>User Agent:</span>
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
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {report.localstorage && Object.keys(report.localstorage).length > 0 && (
                <div>
                  <h4 className='font-medium mb-2'>Local Storage</h4>
                  <Table>
                    <TableBody>
                      {Object.entries(report.localstorage).map(([key, value]) => (
                        <TableRow key={`local-${key}`}>
                          <TableCell className='font-medium py-2 w-[150px]'>{key}</TableCell>
                          <TableCell className='font-mono text-xs py-2 break-all'>{value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {report.sessionstorage && Object.keys(report.sessionstorage).length > 0 && (
                <div>
                  <h4 className='font-medium mb-2'>Session Storage</h4>
                  <Table>
                    <TableBody>
                      {Object.entries(report.sessionstorage).map(([key, value]) => (
                        <TableRow key={`session-${key}`}>
                          <TableCell className='font-medium py-2 w-[150px]'>{key}</TableCell>
                          <TableCell className='font-mono text-xs py-2 break-all'>{value}</TableCell>
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
            <pre className='font-mono text-sm bg-muted rounded p-3 overflow-x-auto'>
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
              <pre className='font-mono text-xs bg-muted rounded p-3 overflow-x-auto max-h-60'>{report.dom}</pre>
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
          <CardContent className='pt-4 flex justify-center'>
            <Image
              src={`data:image/png;base64,${report.screenshot}`}
              alt='Page screenshot'
              className='rounded border shadow-sm max-h-96'
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
