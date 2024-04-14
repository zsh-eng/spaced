"use client";
// See https://stackoverflow.com/questions/74992326/does-use-client-in-next-js-13-root-layout-make-whole-routes-client-component

import { NavigationBar } from "@/components/nav-bar";
import { Toaster } from "@/components/ui/sonner";
import { trpc } from "@/utils/trpc";
import { cn } from "@/utils/ui";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

// See https://ui.shadcn.com/docs/installation/next
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
        )}
      >
        <NavigationBar />
        {children}
        <Toaster />
      </body>
    </ThemeProvider>
  );
}

// See https://trpc.io/docs/client/nextjs/setup#5-configure-_apptsx
export default trpc.withTRPC(ClientLayout);
