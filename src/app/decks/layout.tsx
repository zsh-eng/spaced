const containerClasses =
  "col-start-1 col-end-13 xl:col-start-3 xl:col-end-11 grid grid-cols-8 gap-x-4 pt-6 pb-12";

function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="col-span-12 grid grid-cols-12">
      <div className={containerClasses}>{children}</div>
    </main>
  );
}

export default Layout;
