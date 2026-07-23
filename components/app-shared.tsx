import type { ReactNode } from "react"
import {
  LayoutDashboard,
  TicketCheck,
  KanbanSquare,
  ClipboardList,
  ListTodo,
  Monitor,
  Users,
  BarChart3,
  BookOpen,
  Settings,
  Headset,
} from "lucide-react"

export type SidebarNavItem = {
  title: string
  path?: string
  icon?: ReactNode
  isActive?: boolean
  badge?: string | number
  subItems?: SidebarNavItem[]
}

export type SidebarNavGroup = {
  label?: string
  items: SidebarNavItem[]
}

export const mainNav: SidebarNavItem[] = [
  { title: "Dashboard", path: "/", icon: <LayoutDashboard /> },
  { title: "Tickets", path: "/tickets", icon: <TicketCheck /> },
  { title: "Kanban Board", path: "/tickets/kanban", icon: <KanbanSquare /> },
  { title: "My Tickets", path: "/tickets?assigned_to=me", icon: <ClipboardList /> },
  { title: "All Tickets", path: "/tickets", icon: <ListTodo /> },
  { title: "Assets", path: "#", icon: <Monitor /> },
  { title: "Users", path: "/users", icon: <Users /> },
  { title: "Reports", path: "#", icon: <BarChart3 /> },
  { title: "Knowledge Base", path: "#", icon: <BookOpen /> },
  { title: "Settings", path: "#", icon: <Settings /> },
]

export const navLinks = mainNav

export const footerNavLinks: SidebarNavItem[] = []
