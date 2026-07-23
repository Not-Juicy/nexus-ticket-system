"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateTicketStatus, updateTicketPriority, assignTicket, addComment } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, ArrowUpDown, UserCheck } from "lucide-react"

type Ticket = {
  id: number
  title: string
  description: string | null
  status: string
  priority: string
  createdAt: Date
  updatedAt: Date
  createdBy: { id: number; username: string } | null
  assignedTo: { id: number; username: string } | null
  comments: Array<{
    id: number
    body: string
    createdAt: Date
    user: { id: number; username: string } | null
  }>
}

type User = { id: number; username: string }

const statuses = ["open", "in_progress", "resolved", "closed"]
const priorities = ["low", "medium", "high", "critical"]

function isAllowedTransition(current: string, target: string) {
  const order = ["open", "in_progress", "resolved", "closed"]
  const currIdx = order.indexOf(current)
  const targetIdx = order.indexOf(target)
  return targetIdx >= currIdx && targetIdx - currIdx <= 1
}

function priorityColor(p: string) {
  switch (p) {
    case "critical": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    case "high": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    case "medium": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    default: return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
  }
}

function statusColor(s: string) {
  switch (s) {
    case "open": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    case "in_progress": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    case "resolved": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
  }
}

export function TicketDetailClient({
  ticket,
  users,
  currentUserId,
}: {
  ticket: Ticket
  users: User[]
  currentUserId: string
}) {
  const router = useRouter()
  const [comment, setComment] = useState("")

  async function handleStatusChange(status: string) {
    await updateTicketStatus(ticket.id, status)
    router.refresh()
  }

  async function handlePriorityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await updateTicketPriority(ticket.id, e.target.value)
    router.refresh()
  }

  async function handleAssign(e: React.ChangeEvent<HTMLSelectElement>) {
    await assignTicket(ticket.id, e.target.value)
    router.refresh()
  }

  async function handleComment(formData: FormData) {
    await addComment(ticket.id, formData)
    setComment("")
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <span className="font-mono text-sm text-muted-foreground">#{ticket.id}</span>
                <h2 className="text-xl font-bold mt-0.5">{ticket.title}</h2>
              </div>
              <div className="flex gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(ticket.status)}`}>
                  {ticket.status.replace("_", " ")}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
            <div className="text-sm whitespace-pre-wrap mb-4 p-4 bg-muted/50 rounded-lg">
              {ticket.description || "No description provided."}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span><strong>Created by:</strong> {ticket.createdBy?.username || "Unknown"}</span>
              <span><strong>Assigned to:</strong> {ticket.assignedTo?.username || "Unassigned"}</span>
              <span><strong>Created:</strong> {ticket.createdAt.toLocaleString()}</span>
              <span><strong>Updated:</strong> {ticket.updatedAt.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold mb-4">Comments ({ticket.comments.length})</h3>

            {ticket.comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No comments yet</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {ticket.comments.map((c) => (
                  <div key={c.id} className="bg-muted/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex aspect-square size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {(c.user?.username || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{c.user?.username || "Unknown"}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{c.createdAt.toLocaleString()}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap ml-8">{c.body}</p>
                  </div>
                ))}
              </div>
            )}

            <form action={handleComment} className="mt-4">
              <Textarea
                name="body"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="h-20"
                required
              />
              <Button type="submit" size="sm" className="mt-2 gap-1">
                <Send className="h-3.5 w-3.5" /> Comment
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-5">
            <h3 className="font-semibold text-sm mb-3">Actions</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Status</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {statuses.map((s) => {
                    const allowed = isAllowedTransition(ticket.status, s)
                    return (
                      <button
                        key={s}
                        onClick={() => allowed && handleStatusChange(s)}
                        disabled={!allowed}
                        className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors
                          ${ticket.status === s
                            ? "bg-primary text-primary-foreground"
                            : allowed
                              ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer"
                              : "border border-input bg-background opacity-40 cursor-not-allowed"
                          }`}
                      >
                        {s.replace("_", " ")}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Flow: Open → In Progress → Resolved → Closed</p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <UserCheck className="h-3 w-3" /> Assign To
                </label>
                <select
                  defaultValue={ticket.assignedTo ? String(ticket.assignedTo.id) : ""}
                  onChange={handleAssign}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={String(u.id)}>{u.username}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3" /> Priority
                </label>
                <select
                  defaultValue={ticket.priority}
                  onChange={handlePriorityChange}
                  className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
