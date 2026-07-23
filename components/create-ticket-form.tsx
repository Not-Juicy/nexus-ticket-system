"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createTicket } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PlusCircle } from "lucide-react"

type User = { id: number; username: string }

export function CreateTicketForm({ users }: { users: User[] }) {
  const router = useRouter()
  const [error, setError] = useState("")

  async function handleSubmit(formData: FormData) {
    try {
      await createTicket(formData)
      router.push("/tickets")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create ticket")
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2">{error}</div>
      )}
      <div className="space-y-2">
        <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
        <Input id="title" name="title" placeholder="Brief description of the issue" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Detailed description..." className="h-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select id="priority" name="priority" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="low">Low</option>
            <option value="medium" selected>Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="assigned_to">Assign To</Label>
          <select id="assigned_to" name="assigned_to" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={String(u.id)}>{u.username}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="gap-1">
          <PlusCircle className="h-4 w-4" /> Create Ticket
        </Button>
        <a href="/tickets" className="inline-flex items-center justify-center rounded-lg px-2.5 h-8 text-sm font-medium hover:bg-muted transition-colors">Cancel</a>
      </div>
    </form>
  )
}
