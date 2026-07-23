import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PlusCircle, ArrowRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string; assigned_to?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const params = await searchParams
  const where: Record<string, unknown> = {}

  if (params.status) where.status = params.status
  if (params.priority) where.priority = params.priority
  if (params.assigned_to === "me") where.assignedToId = parseInt(session.user.id)
  else if (params.assigned_to === "unassigned") where.assignedToId = null
  else if (params.assigned_to) where.assignedToId = parseInt(params.assigned_to)

  const [tickets, users] = await Promise.all([
    prisma.ticket.findMany({
      where: where as any,
      include: {
        createdBy: { select: { username: true } },
        assignedTo: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ select: { id: true, username: true } }),
  ])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-sm text-muted-foreground">Manage and track all tickets</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/export/csv" className="inline-flex items-center justify-center gap-1.5 rounded-lg h-8 px-2.5 text-sm font-medium border border-input bg-background hover:bg-accent transition-colors">
            <Download className="size-3.5" /> Export
          </a>
          <Link href="/tickets/new" className="inline-flex items-center justify-center gap-1.5 rounded-lg h-8 px-2.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/80 transition-colors">
            <PlusCircle className="size-4" /> New Ticket
          </Link>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-4 border-b">
          <form method="GET" className="flex flex-wrap gap-2 items-end">
            <select name="status" defaultValue={params.status || ""} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select name="priority" defaultValue={params.priority || ""} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select name="assigned_to" defaultValue={params.assigned_to || ""} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={String(u.id)}>{u.username}</option>
              ))}
            </select>
            <Button type="submit" variant="outline" size="sm">Filter</Button>
            <Link href="/tickets" className="inline-flex items-center justify-center rounded-lg h-7 px-2.5 text-sm font-medium hover:bg-muted transition-colors">Clear</Link>
          </form>
        </div>

        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No tickets found</p>
            <p className="text-sm mb-4">
              {params.status || params.priority || params.assigned_to
                ? "Try different filters or clear them above"
                : "Get started by creating your first ticket"}
            </p>
            {!params.status && !params.priority && !params.assigned_to && (
              <Link href="/tickets/new" className="inline-flex items-center gap-1.5 rounded-lg h-8 px-4 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/80 transition-colors">
                <PlusCircle className="size-4" /> Create First Ticket
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">#</th>
                  <th className="text-left py-3 px-4 font-medium">Title</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Status</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Priority</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Creator</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Assigned</th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Date</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4 font-mono text-muted-foreground">#{t.id}</td>
                    <td className="py-3 px-4">
                      <Link href={`/tickets/${t.id}`} className="font-medium hover:text-primary no-underline">{t.title}</Link>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                        ${t.status === "open" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          t.status === "in_progress" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          t.status === "resolved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                        ${t.priority === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          t.priority === "high" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          t.priority === "medium" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">{t.createdBy?.username || "—"}</td>
                    <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">{t.assignedTo?.username || "—"}</td>
                    <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">{t.createdAt.toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <Link href={`/tickets/${t.id}`} className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
