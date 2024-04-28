import { gridChildContentGrid } from "@/components/ui/grid";
import { cn } from "@/utils/ui";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main
      className={cn(
        gridChildContentGrid,
        "h-full grid-rows-[min-content_1fr] px-0 pb-12 pt-6 sm:px-4",
      )}
    >
      {children}
    </main>
  );
}

export default Layout;
