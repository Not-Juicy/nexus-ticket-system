"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { updateProfile } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"

export function ProfileForm({ email }: { email: string }) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError("")
    setSuccess(false)
    try {
      await updateProfile(formData)
      setSuccess(true)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update")
    }
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="p-6">
        <h3 className="font-semibold mb-4">Change Password</h3>
        {error && <div className="bg-destructive/10 text-destructive text-sm rounded-md px-3 py-2 mb-4">{error}</div>}
        {success && <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm rounded-md px-3 py-2 mb-4">Profile updated successfully</div>}
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Email</Label>
            <Input name="email" defaultValue={email} type="email" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Current Password</Label>
            <Input name="currentPassword" type="password" placeholder="Leave blank to keep same" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">New Password</Label>
            <Input name="newPassword" type="password" placeholder="Leave blank to keep same" />
          </div>
          <Button type="submit" size="sm" className="gap-1">
            <Save className="size-3.5" /> Save Changes
          </Button>
        </form>
      </div>
    </div>
  )
}
