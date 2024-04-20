// See https://stackoverflow.com/questions/74992326/does-use-client-in-next-js-13-root-layout-make-whole-routes-client-component

import ClientLayout from "@/components/client-layout";
import { cn } from "@/utils/ui";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spaced",
  description: "A better way of learning.",
};

// See https://ui.shadcn.com/docs/installation/next
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "grid min-h-screen grid-cols-12 grid-rows-[min-content_1fr] gap-x-6 bg-background px-2 font-sans antialiased sm:px-6",
          inter.variable,
        )}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

// See https://trpc.io/docs/client/nextjs/setup#5-configure-_apptsx
export default RootLayout;
