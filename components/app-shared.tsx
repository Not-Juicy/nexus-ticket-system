import type { ReactNode } from "react"
import {
  LayoutDashboard,
  TicketCheck,
  ListTodo,
  KanbanSquare,
  PlusCircle,
  Users,
} from "lucide-react"

export type SidebarNavItem = {
  title: string
  path?: string
  icon?: ReactNode
  isActive?: boolean
  subItems?: SidebarNavItem[]
}

export type SidebarNavGroup = {
  label?: string
  items: SidebarNavItem[]
}

export const navGroups: SidebarNavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        path: "/",
        icon: <LayoutDashboard />,
      },
    ],
  },
  {
    label: "Tickets",
    items: [
      {
        title: "All Tickets",
        path: "/tickets",
        icon: <ListTodo />,
      },
      {
        title: "Kanban Board",
        path: "/tickets/kanban",
        icon: <KanbanSquare />,
      },
      {
        title: "New Ticket",
        path: "/tickets/new",
        icon: <PlusCircle />,
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        title: "Users",
        path: "/users",
        icon: <Users />,
      },
    ],
  },
]

export type NavLink = {
  title: string
  path: string
  icon?: ReactNode
  isActive?: boolean
}

export const navLinks: NavLink[] = [
  { title: "Dashboard", path: "/", icon: <LayoutDashboard /> },
  { title: "Tickets", path: "/tickets", icon: <ListTodo /> },
  { title: "Kanban", path: "/tickets/kanban", icon: <KanbanSquare /> },
  { title: "Users", path: "/users", icon: <Users /> },
]

export const footerNavLinks: SidebarNavItem[] = []
