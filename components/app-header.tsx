"use client"

import { cn } from "@/lib/utils"
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger"
import { usePathname } from "next/navigation"
import { Search, Bell, ChevronDown, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"

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
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const user = session?.user
  const initials = user?.name?.charAt(0)?.toUpperCase() || "A"

  return (
    <header className={cn("sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-4 md:px-6")}>
      <div className="flex items-center gap-3 min-w-0">
        <CustomSidebarTrigger />
        <h1 className="font-semibold text-sm truncate">{title}</h1>
      </div>

      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets, users, assets..."
            className="h-9 pl-9 text-sm rounded-lg bg-muted/50 border-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {mounted && (
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">3</span>
        </Button>
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l">
          <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {initials}
          </div>
          <div className="hidden lg:block text-sm leading-tight">
            <div className="font-medium truncate max-w-[120px]">{user?.name || "User"}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[120px]">{user?.role || "member"}</div>
          </div>
          <ChevronDown className="size-3 text-muted-foreground hidden lg:block" />
        </div>
      </div>
    </header>
  )
}
