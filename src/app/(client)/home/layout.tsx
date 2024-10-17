import { Sidebar } from "@repo/components/sidebar";
export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex ">
      <Sidebar />
      {children}
    </div>
  );
}
