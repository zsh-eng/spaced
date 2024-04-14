const containerClasses =
  "flex flex-col items-center gap-4 md:items-start md:gap-8 max-w-6xl";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col items-center justify-center px-2 md:py-4 lg:justify-between">
      <div className={containerClasses}>{children}</div>
    </main>
  );
}

export default Layout;
