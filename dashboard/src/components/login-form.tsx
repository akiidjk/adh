import { login } from '@/app/login/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [state, loginAction] = useActionState(login, undefined);
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Login</CardTitle>
          <CardDescription>Enter your username below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction}>
            <div className='flex flex-col gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='username'>Username</Label>
                {state?.errors?.username && <p className='text-red-500'>{state.errors.username}</p>}
                <Input id='username' type='text' placeholder='akiidjk' required name='username' />
              </div>
              <div className='grid gap-2'>
                <div className='flex items-center'>
                  <Label htmlFor='password'>Password</Label>
                  <a href='#' className='ml-auto inline-block text-sm underline-offset-4 hover:underline'>
                    Forgot your password?
                  </a>
                </div>
                {state?.errors?.password && <p className='text-red-500'>{state.errors.password}</p>}
                <Input id='password' type='password' name='password' required />
              </div>
              <SubmitButton />
            </div>
            <div className='mt-4 text-center text-sm'>
              Don&apos;t have an account?{' '}
              <a href='/signup' className='underline underline-offset-4'>
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SubmitButton({ className }: { className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type='submit' className={cn('', className)}>
      Login
    </Button>
  );
}
