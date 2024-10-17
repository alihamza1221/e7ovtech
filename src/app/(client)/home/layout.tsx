import { Sidebar } from "@repo/components/sidebar";
export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex ">
      <Sidebar />
      <div className="mx-auto my-auto  w-full h-[calc(100vh-120px)]">
        {children}
      </div>
    </div>
  );
}
