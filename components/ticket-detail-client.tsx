"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { updateTicketStatus, updateTicketPriority, assignTicket, addComment, deleteTicket } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, ArrowUpDown, UserCheck, Paperclip, Trash2, Download, X } from "lucide-react"

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
  attachments: Array<{
    id: number
    fileName: string
    fileSize: number
    mimeType: string
    path: string
    createdAt: Date
    user: { username: string } | null
  }>
  comments: Array<{
    id: number
    body: string
    createdAt: Date
    user: { id: number; username: string } | null
  }>
}

type User = { id: number; username: string }

const statuses = ["open", "in_progress", "resolved", "closed", "archived"]
const priorities = ["low", "medium", "high", "critical"]

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
    case "archived": return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
    default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const isAdmin = true

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

  async function handleDelete() {
    if (!confirm("Delete this ticket permanently?")) return
    await deleteTicket(ticket.id)
    router.push("/tickets")
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("ticketId", String(ticket.id))
      await fetch("/api/upload", { method: "POST", body: formData })
      router.refresh()
    } catch (err) {
      console.error("Upload failed", err)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
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

        {ticket.attachments.length > 0 && (
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="p-5">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
                <Paperclip className="size-3.5" /> Attachments ({ticket.attachments.length})
              </h3>
              <div className="space-y-2">
                {ticket.attachments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-8 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {a.mimeType.startsWith("image/") ? "🖼" : "📎"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.fileName}</p>
                        <p className="text-xs text-muted-foreground">{formatSize(a.fileSize)}</p>
                      </div>
                    </div>
                    <a href={a.path} target="_blank" download className="shrink-0 text-muted-foreground hover:text-foreground">
                      <Download className="size-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-5">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5">
              <Paperclip className="size-3.5" /> Upload File
            </h3>
            <input
              ref={fileRef}
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/80 disabled:opacity-50"
            />
            {uploading && <p className="text-xs text-muted-foreground mt-1">Uploading...</p>}
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold mb-4">Comments ({ticket.comments.length})</h3>

            {ticket.comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No comments yet. Start the discussion.</p>
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
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={ticket.status === s}
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors
                        ${ticket.status === s
                          ? "bg-primary text-primary-foreground"
                          : "border border-input bg-background hover:bg-accent cursor-pointer"
                        }`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
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

              <hr className="border-t" />

              <Button variant="destructive" size="sm" className="w-full gap-1" onClick={handleDelete}>
                <Trash2 className="size-3.5" /> Delete Ticket
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
