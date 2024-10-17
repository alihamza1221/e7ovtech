"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Menu } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet";

// Mock data for workspaces and users
import { Workspace } from "@repo/db/models/workspace";
import axios from "axios";
const users = ["Alice", "Bob", "Charlie", "David"];

export function Sidebar() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  useEffect(() => {
    const getWorkspaces = async () => {
      const res = await axios.get("/api/workspace/getworkspace");
      if (res.data.data) {
        setWorkspaces(res.data.data);
      }
    };

    getWorkspaces();
  }, []);
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-6">
        <section>
          <h3 className="mb-2 text-lg font-semibold">Admin</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/home/dashboard"
                className="text-blue-600 hover:underline"
              >
                Dashboard
              </Link>
            </li>
          </ul>
        </section>
        <section>
          <h3 className="mb-2 text-lg font-semibold">Workspaces</h3>
          <ul className="space-y-2">
            {workspaces.map((workspace, index) => (
              <li key={`${workspace._id}-${index}`}>
                <a
                  href={`/home/workspace?workspaceId=${workspace._id}`}
                  className="text-blue-600 hover:underline"
                >
                  {workspace.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="mb-2 text-lg font-semibold">Direct Messages</h3>
          <ul className="space-y-2">
            {users.map((user, index) => (
              <li key={index}>
                <Link
                  href={`/messages/${user.toLowerCase()}`}
                  className="text-blue-600 hover:underline"
                >
                  {user}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ScrollArea>
  );

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-40 lg:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[300px] sm:w-[400px] p-0 lg:hidden"
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
            </div>
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
      <div className="hidden lg:flex flex-col w-[300px] border-r bg-white h-screen dark:bg-neutral-950">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
        </div>
        <SidebarContent />
      </div>
    </>
  );
}
