import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { KanbanBoard } from "@/components/kanban-board"

export const dynamic = "force-dynamic"

export default async function KanbanPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const tickets = await prisma.ticket.findMany({
    include: {
      createdBy: { select: { username: true } },
      assignedTo: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <p className="text-sm text-muted-foreground">Drag and drop to update ticket status</p>
      </div>
      <KanbanBoard tickets={tickets as any} />
    </div>
  )
}
