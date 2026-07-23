"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUser } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"

type User = {
  id: number
  username: string
  email: string | null
  role: string
  createdAt: Date
}

export function UsersClient({ users }: { users: User[] }) {
  const router = useRouter()
  const [error, setError] = useState("")

  async function handleSubmit(formData: FormData) {
    try {
      await createUser(formData)
      router.refresh()
      setError("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create user")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-5">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" /> Add User
            </h3>
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2 mt-3">{error}</div>
            )}
            <form action={handleSubmit} className="space-y-3 mt-4">
              <div className="space-y-1">
                <Label className="text-xs">Username <span className="text-destructive">*</span></Label>
                <Input name="username" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Password <span className="text-destructive">*</span></Label>
                <Input name="password" type="password" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input name="email" type="email" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Role</Label>
                <select name="role" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button type="submit" size="sm" className="w-full gap-1">
                <UserPlus className="h-3.5 w-3.5" /> Add User
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="p-5 border-b">
            <h3 className="font-semibold flex items-center gap-2">Team Members</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Username</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex aspect-square size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium">{u.username}</span>
                          {u.role === "admin" && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 text-[10px] font-medium">admin</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{u.email || "—"}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${u.role === "admin" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{u.createdAt.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
