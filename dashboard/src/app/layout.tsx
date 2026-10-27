import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Adh Dashboard',
  description: 'Your selfhosted webhook dashboard'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute={['class', 'data-mode']} defaultTheme='system' enableSystem disableTransitionOnChange>
          {/* isolation:isolate keeps Kumo's portaled overlays above app layout z-index */}
          <div className='isolate'>{children}</div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
