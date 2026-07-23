import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const [openCount, inProgressCount, resolvedCount, totalCount, myTickets, recentTickets] = await Promise.all([
    prisma.ticket.count({ where: { status: "open" } }),
    prisma.ticket.count({ where: { status: "in_progress" } }),
    prisma.ticket.count({ where: { status: "resolved" } }),
    prisma.ticket.count(),
    prisma.ticket.findMany({
      where: { assignedToId: parseInt(session.user.id) },
      include: { createdBy: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.ticket.findMany({
      include: {
        createdBy: { select: { username: true } },
        assignedTo: { select: { username: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <div className="text-sm text-muted-foreground">Open</div>
          <div className="text-3xl font-bold text-blue-500">{openCount}</div>
        </div>
        <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <div className="text-sm text-muted-foreground">In Progress</div>
          <div className="text-3xl font-bold text-amber-500">{inProgressCount}</div>
        </div>
        <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <div className="text-sm text-muted-foreground">Resolved</div>
          <div className="text-3xl font-bold text-green-500">{resolvedCount}</div>
        </div>
        <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
          <div className="text-sm text-muted-foreground">Total Tickets</div>
          <div className="text-3xl font-bold text-primary">{totalCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold">My Assigned Tickets</h3>
          </div>
          {myTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">No tickets assigned to you</p>
            </div>
          ) : (
            <div className="divide-y">
              {myTickets.map((t) => (
                <Link key={t.id} href={`/tickets/${t.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors no-underline text-inherit"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">
                      <span className="text-muted-foreground font-mono text-sm">#{t.id}</span> {t.title}
                    </div>
                    <div className="text-xs text-muted-foreground">{t.createdBy?.username || "Unknown"}</div>
                  </div>
                  <div className="flex gap-1.5 ml-3 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                      ${t.priority === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        t.priority === "high" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        t.priority === "medium" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                      {t.priority}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card shadow-sm">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Recent Tickets</h3>
            <Link href="/tickets" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          {recentTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">No tickets yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentTickets.map((t) => (
                <Link key={t.id} href={`/tickets/${t.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors no-underline text-inherit"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">
                      <span className="text-muted-foreground font-mono text-sm">#{t.id}</span> {t.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.createdBy?.username || "Unknown"}
                      {t.assignedTo ? ` → ${t.assignedTo.username}` : ""}
                    </div>
                  </div>
                  <div className="flex gap-1.5 ml-3 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                      ${t.priority === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        t.priority === "high" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        t.priority === "medium" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                      {t.priority}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                      ${t.status === "open" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        t.status === "in_progress" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        t.status === "resolved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
