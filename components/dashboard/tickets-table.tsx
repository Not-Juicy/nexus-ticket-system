"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TicketRow = {
  id: number
  title: string
  requester: string
  priority: string
  status: string
  dueDate: Date | null
}

const priorityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
}

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
}

const ITEMS_PER_PAGE = 5

export function TicketsTable({ tickets }: { tickets: TicketRow[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(tickets.length / ITEMS_PER_PAGE)
  const pageTickets = tickets.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">My Assigned Tickets</h3>
        <Link href="/tickets?assigned_to=me" className="text-xs text-primary hover:underline">View All</Link>
      </div>
      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="text-sm">No tickets assigned to you</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2.5 px-4 font-medium text-xs text-muted-foreground">ID</th>
                  <th className="text-left py-2.5 px-4 font-medium text-xs text-muted-foreground">Title</th>
                  <th className="text-left py-2.5 px-4 font-medium text-xs text-muted-foreground hidden sm:table-cell">Requester</th>
                  <th className="text-left py-2.5 px-4 font-medium text-xs text-muted-foreground hidden md:table-cell">Priority</th>
                  <th className="text-left py-2.5 px-4 font-medium text-xs text-muted-foreground hidden md:table-cell">Status</th>
                  <th className="text-left py-2.5 px-4 font-medium text-xs text-muted-foreground hidden lg:table-cell">Due Date</th>
                  <th className="py-2.5 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {pageTickets.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-muted/20">
                    <td className="py-2.5 px-4 font-mono text-xs text-muted-foreground">#{t.id}</td>
                    <td className="py-2.5 px-4">
                      <Link href={`/tickets/${t.id}`} className="font-medium hover:text-primary no-underline">
                        {t.title}
                      </Link>
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground hidden sm:table-cell">{t.requester}</td>
                    <td className="py-2.5 px-4 hidden md:table-cell">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", priorityColors[t.priority] || "")}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 hidden md:table-cell">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", statusColors[t.status] || "")}>
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-muted-foreground hidden lg:table-cell">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-2.5 px-4">
                      <Link href={`/tickets/${t.id}`} className="inline-flex items-center justify-center size-7 rounded-md hover:bg-muted transition-colors">
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t">
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="size-7" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export type { TicketRow }
