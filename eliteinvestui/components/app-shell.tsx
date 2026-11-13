"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { AppSidebar } from "@/components/app-sidebar"
import { Navbar } from "@/components/navbar"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      {/* Main content area */}
      <div
        className={cn(
          "flex flex-col transition-all duration-300 ease-in-out min-h-screen",
          sidebarCollapsed ? "ml-[68px]" : "ml-[260px]"
        )}
      >
        {/* Navbar */}
        <Navbar
          onMenuToggle={() => setSidebarCollapsed((c) => !c)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
