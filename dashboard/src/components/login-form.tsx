import { Webhook } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { login } from '@/app/login/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [state, loginAction] = useActionState(login, undefined);
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className='flex flex-col items-center gap-2 text-center'>
        <div className='flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm'>
          <Webhook className='size-6' aria-hidden='true' />
        </div>
        <span className='text-lg font-semibold tracking-tight'>ADH Dashboard</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-xl'>Sign in</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction}>
            <div className='flex flex-col gap-5'>
              <div className='grid gap-2'>
                <Label htmlFor='username'>Username</Label>
                <Input
                  id='username'
                  type='text'
                  placeholder='akiidjk'
                  required
                  name='username'
                  autoComplete='username'
                />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='password'>Password</Label>
                <Input id='password' type='password' name='password' required autoComplete='current-password' />
              </div>
              {(state?.errors?.username || state?.errors?.password) && (
                <p role='alert' className='text-sm font-medium text-destructive'>
                  {state.errors.username ?? state.errors.password}
                </p>
              )}
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type='submit' className='w-full'>
      {pending ? 'Signing in…' : 'Sign in'}
    </Button>
  );
}
