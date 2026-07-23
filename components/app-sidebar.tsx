import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarSeparator } from "@/components/ui/sidebar"
import { mainNav } from "@/components/app-shared"
import { NavUser } from "@/components/nav-user"
import { TicketCheck, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AppSidebarProps {
  unassignedCount?: number
  overdueCount?: number
}

const shortcuts = [
  { title: "Unassigned Tickets", key: "unassigned" as const, color: "text-amber-500" },
  { title: "Pending Approval", key: "pending" as const, color: "text-blue-500" },
  { title: "Overdue Tickets", key: "overdue" as const, color: "text-red-500" },
]

export function AppSidebar({ unassignedCount = 0, overdueCount = 0 }: AppSidebarProps) {
  const badgeCounts: Record<string, number> = {
    unassigned: unassignedCount,
    pending: 0,
    overdue: overdueCount,
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="h-14 justify-center">
        <SidebarMenuButton render={<Link href="/" />} size="lg">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm">
            <TicketCheck className="size-4" />
          </div>
          <span className="font-bold text-base tracking-tight">
            <span className="text-blue-600 dark:text-blue-400">Nexus</span>
            <span className="text-muted-foreground font-normal">/Tickets</span>
          </span>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mainNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={item.path && item.path !== "#" ? <Link href={item.path} /> : undefined}
                  className={cn(item.path === "#" && "cursor-default opacity-70")}
                  tooltip={item.title}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Shortcuts</SidebarGroupLabel>
          <SidebarMenu>
            {shortcuts.map((s) => (
              <SidebarMenuItem key={s.title}>
                <SidebarMenuButton className="text-muted-foreground" size="sm">
                  <div className={cn("size-2 rounded-full", s.color.replace("text-", "bg-"))} />
                  <span className="flex-1">{s.title}</span>
                  {badgeCounts[s.key] > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums">
                      {badgeCounts[s.key]}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm" className="text-muted-foreground">
              <ChevronLeft className="size-4" />
              <span>Collapse</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
