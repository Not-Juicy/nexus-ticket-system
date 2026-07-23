import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UsersClient } from "@/components/users-client"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") redirect("/")

  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">Manage team members</p>
      </div>
      <UsersClient users={users as any} />
    </div>
  )
}
