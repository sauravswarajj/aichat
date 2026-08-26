"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Sidebar: Fixed desktop left column + Mobile slide-over drawer */}
      <Sidebar
        isOpenMobile={sidebarOpenMobile}
        onCloseMobile={() => setSidebarOpenMobile(false)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar onToggleSidebar={() => setSidebarOpenMobile((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto flex flex-col">{children}</main>
      </div>
    </div>
  );
}
