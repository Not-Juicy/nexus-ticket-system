"use client"

import { useSession, signOut } from "next-auth/react"
import { ChevronUp, LogOut, User as UserIcon } from "lucide-react"
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function NavUser() {
  const { data: session } = useSession()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const user = session?.user
  const initials = user?.name?.charAt(0)?.toUpperCase() || "?"

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <SidebarMenuButton
          size="lg"
          render={<DropdownMenuTrigger />}
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            {initials}
          </div>
          {!isCollapsed && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user?.name || "User"}</span>
              <span className="truncate text-xs text-muted-foreground">{user?.role || "member"}</span>
            </div>
          )}
          {!isCollapsed && <ChevronUp className="ml-auto size-4" />}
        </SidebarMenuButton>
        <DropdownMenuContent side="top" className="w-56" align="end">
          <DropdownMenuItem>
            <UserIcon className="mr-2 size-4" />
            <span>{user?.name}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="mr-2 size-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
