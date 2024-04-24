"use client";
// See https://stackoverflow.com/questions/74992326/does-use-client-in-next-js-13-root-layout-make-whole-routes-client-component

import { NavigationBar } from "@/components/nav-bar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { FlashcardSessionProvider } from "@/providers/flashcard-session";
import { HistoryProvider } from "@/providers/history";
import { trpc } from "@/utils/trpc";
import { PropsWithChildren } from "react";

function ClientLayout({ children }: PropsWithChildren<{}>) {
  return (
    <HistoryProvider>
      <FlashcardSessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavigationBar />
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 1000,
            }}
          />
        </ThemeProvider>
      </FlashcardSessionProvider>
    </HistoryProvider>
  );
}

// See https://trpc.io/docs/client/nextjs/setup#5-configure-_apptsx
export default trpc.withTRPC(ClientLayout) as typeof ClientLayout;
