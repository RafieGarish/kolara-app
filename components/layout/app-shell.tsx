"use client";

import { cn } from "@/lib/utils";
import { useUi } from "@/lib/stores/ui";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { InviteDialog } from "@/components/team/invite-dialog";
import dynamic from "next/dynamic";

// Chat uses wall-clock timestamps, so it renders on the client only.
const ChatPanel = dynamic(() => import("@/components/chat/chat-panel").then((m) => m.ChatPanel), { ssr: false });

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // sidebar state is read in <Sidebar/>; keep the shell a thin layout container
  void useUi;
  if (pathname === "/" || pathname === "/login" || pathname === "/register") return <>{children}</>;

  return (
    <>
      <div className={cn("app")}>
        <Sidebar />
        <div className="main">
          <Topbar />
          {children}
        </div>
      </div>
      <InviteDialog />
      <ChatPanel />
    </>
  );
}
