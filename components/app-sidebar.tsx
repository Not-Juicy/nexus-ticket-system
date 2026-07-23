import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { NavGroup } from "@/components/nav-group"
import { footerNavLinks, navGroups } from "@/components/app-shared"
import { NavUser } from "@/components/nav-user"
import { PlusIcon, TicketCheck } from "lucide-react"
import Link from "next/link"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="h-14 justify-center">
        <SidebarMenuButton render={<Link href="/" />} size="lg">
          <TicketCheck className="text-primary" />
          <span className="font-bold">NEXUS</span>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              render={<Link href="/tickets/new" />}
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              tooltip="New Ticket"
            >
              <PlusIcon />
              <span>New Ticket</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroup>
        {navGroups.map((group, index) => (
          <NavGroup key={`sidebar-group-${index}`} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        {footerNavLinks.length > 0 && (
          <SidebarMenu className="mt-2">
            {footerNavLinks.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={item.path ? <Link href={item.path} /> : undefined}
                  className="text-muted-foreground"
                  isActive={item.isActive}
                  size="sm"
                >
                  {item.icon}<span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
