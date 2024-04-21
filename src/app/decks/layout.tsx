import { gridChildContentGrid } from "@/components/ui/grid";
import { cn } from "@/utils/ui";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className={cn(gridChildContentGrid, "pb-12 pt-6")}>{children}</main>
  );
}

export default Layout;
