"use client"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger"
import { usePathname } from "next/navigation"
import { TicketCheck, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tickets": "All Tickets",
  "/tickets/new": "New Ticket",
  "/tickets/kanban": "Kanban Board",
  "/users": "Users",
}

export function AppHeader() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || "NEXUS"
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className={cn("sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 md:px-6")}>
      <div className="flex items-center gap-3">
        <CustomSidebarTrigger />
        <Separator className="mr-2 h-4" orientation="vertical" />
        <div className="flex items-center gap-2">
          <TicketCheck className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">{title}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </header>
  )
}
