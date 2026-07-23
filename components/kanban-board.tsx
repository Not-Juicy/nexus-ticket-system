"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateTicketStatus } from "@/lib/actions"
import Link from "next/link"

type Ticket = {
  id: number
  title: string
  description: string | null
  status: string
  priority: string
  createdBy: { username: string } | null
  assignedTo: { username: string } | null
}

const columns = [
  { key: "open", label: "Open", color: "border-t-blue-500" },
  { key: "in_progress", label: "In Progress", color: "border-t-amber-500" },
  { key: "resolved", label: "Resolved", color: "border-t-green-500" },
  { key: "closed", label: "Closed", color: "border-t-zinc-500" },
]

function priorityColor(p: string) {
  switch (p) {
    case "critical": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    case "high": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    case "medium": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    default: return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
  }
}

export function KanbanBoard({ tickets }: { tickets: Ticket[] }) {
  const router = useRouter()
  const [dragOver, setDragOver] = useState<string | null>(null)

  async function handleDrop(status: string, ticketId: number) {
    await updateTicketStatus(ticketId, status)
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colTickets = tickets.filter((t) => t.status === col.key)
        return (
          <div
            key={col.key}
            className={`rounded-xl border bg-card shadow-sm border-t-4 ${col.color} ${dragOver === col.key ? "ring-2 ring-primary" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(col.key) }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(null)
              const ticketId = parseInt(e.dataTransfer.getData("text/plain"))
              if (!isNaN(ticketId)) handleDrop(col.key, ticketId)
            }}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-semibold text-sm">{col.label}</h3>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{colTickets.length}</span>
            </div>
            <div className="p-2 space-y-2 min-h-[200px]">
              {colTickets.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                  No tickets
                </div>
              ) : (
                colTickets.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", String(t.id))}
                    className="rounded-lg border bg-card p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <Link href={`/tickets/${t.id}`} className="no-underline text-inherit" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-muted-foreground">#{t.id}</span>
                        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${priorityColor(t.priority)}`}>
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-sm font-medium line-clamp-2">{t.title}</p>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                        <span>{t.createdBy?.username || "—"}</span>
                        {t.assignedTo && <span>→ {t.assignedTo.username}</span>}
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
