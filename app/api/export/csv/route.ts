import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const tickets = await prisma.ticket.findMany({
    include: {
      createdBy: { select: { username: true } },
      assignedTo: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const header = "ID,Title,Description,Status,Priority,Category,Created By,Assigned To,Created,Updated,Due Date\n"
  const rows = tickets.map((t) => {
    const escape = (s: string | null | undefined) => `"${(s || "").replace(/"/g, '""')}"`
    return [
      t.id,
      escape(t.title),
      escape(t.description),
      t.status,
      t.priority,
      t.category,
      escape(t.createdBy?.username),
      escape(t.assignedTo?.username),
      t.createdAt.toISOString(),
      t.updatedAt.toISOString(),
      t.dueDate?.toISOString() || "",
    ].join(",")
  }).join("\n")

  return new Response(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=tickets.csv",
    },
  })
}
