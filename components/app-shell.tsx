import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { prisma } from "@/lib/prisma"

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [unassignedCount, overdueCount] = await Promise.all([
    prisma.ticket.count({ where: { assignedToId: null, status: { not: "closed" } } }),
    prisma.ticket.count({
      where: {
        dueDate: { lt: new Date() },
        status: { notIn: ["resolved", "closed"] },
      },
    }),
  ])

  return (
    <div className="overflow-hidden">
      <SidebarProvider className="relative h-svh">
        <AppSidebar unassignedCount={unassignedCount} overdueCount={overdueCount} />
        <SidebarInset className="md:peer-data-[variant=inset]:ml-0">
          <AppHeader />
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
