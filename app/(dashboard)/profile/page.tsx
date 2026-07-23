import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "./profile-form"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { username: true, email: true, role: true, createdAt: true },
  })

  if (!user) redirect("/")

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Username</span>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Role</span>
              <p className="font-medium capitalize">{user.role}</p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Member since</span>
              <p className="font-medium">{user.createdAt.toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
      <ProfileForm email={user.email || ""} />
    </div>
  )
}
