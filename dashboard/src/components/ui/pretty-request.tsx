import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RequestMessage } from '@/lib/models';
import { format } from 'date-fns';

export function PrettyRequest({ data: msg }: { data: RequestMessage }) {
  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='pb-2'>
          <div className='flex justify-between items-start'>
            <div>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>{format(new Date(msg.timestamp), 'PPPpp')}</CardDescription>
            </div>
            <div className='flex gap-2'>
              <Badge variant='outline'>{msg.protocol}</Badge>
              <Badge
                className={
                  msg.method === 'GET'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : msg.method === 'POST'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : msg.method === 'DELETE'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : msg.method === 'PUT'
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-gray-500 hover:bg-gray-600 text-white'
                }>
                {msg.method}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className='pt-4 grid gap-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <h3 className='font-medium mb-1'>Client</h3>
              <p className='text-sm'>
                {msg.address}:{msg.port}
              </p>
            </div>
            <div>
              <h3 className='font-medium mb-1'>User Agent</h3>
              <p className='text-sm line-clamp-1'>{msg.useragent}</p>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='w-auto truncate'>
              <h3 className='font-medium mb-2'>Path</h3>
              <p className='text-sm font-mono bg-muted rounded px-2 py-1 truncate'>{msg.path}</p>
            </div>
            <div>
              <h3 className='font-medium mb-2'>Form Data</h3>
              {Object.keys(msg.form).length > 0 ? (
                <div className='space-y-2 flex gap-2'>
                  {Object.entries(msg.form).map(([key, value]) => (
                    <div key={key} className='flex items-baseline gap-2 text-sm'>
                      <span className='text-md font-bold text-muted-foreground'>{key}:</span>
                      <span className='font-mono bg-muted rounded px-2 py-1 text-xs break-all'>
                        {typeof value === 'object' ? JSON.stringify(value) : value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>No form data submitted</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-2'>
          <CardTitle>Headers</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className='pt-4'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[150px]'>Header</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(msg.headers).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className='font-medium'>{key}</TableCell>
                  <TableCell className='font-mono text-xs'>{Array.isArray(value) ? value.join(', ') : value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cookies Section */}
      {msg.cookies.length > 0 && (
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle>Cookies</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className='pt-4'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Security</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {msg.cookies.map((cookie) => (
                  <TableRow key={cookie.Name}>
                    <TableCell className='font-medium'>{cookie.Name}</TableCell>
                    <TableCell className='font-mono text-xs'>{cookie.Value}</TableCell>
                    <TableCell>
                      <div className='flex gap-1'>
                        {cookie.Secure && <Badge variant='outline'>Secure</Badge>}
                        {cookie.HttpOnly && <Badge variant='outline'>HttpOnly</Badge>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
