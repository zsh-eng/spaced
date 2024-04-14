// See https://stackoverflow.com/questions/74992326/does-use-client-in-next-js-13-root-layout-make-whole-routes-client-component

import ClientLayout from "@/components/client-layout";
import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spaced",
  description: "A better way of learning.",
};

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}

// See https://trpc.io/docs/client/nextjs/setup#5-configure-_apptsx
export default RootLayout;
