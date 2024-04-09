'use client';
// See https://stackoverflow.com/questions/74992326/does-use-client-in-next-js-13-root-layout-make-whole-routes-client-component

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/utils/ui';
import { Toaster } from '@/components/ui/sonner';
import { trpc } from '@/utils/trpc';

// See https://ui.shadcn.com/docs/installation/next
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

// TODO handle metadata with tRPC and Next.js
// export const metadata: Metadata = {
//   title: 'Spaced',
//   description: 'A better way of learning.',
// };

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        {children}
        <Toaster position='top-center' />
      </body>
    </html>
  );
}

// See https://trpc.io/docs/client/nextjs/setup#5-configure-_apptsx
export default trpc.withTRPC(RootLayout);
