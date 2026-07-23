import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CreateTicketForm } from "@/components/create-ticket-form"

export const dynamic = "force-dynamic"

export default async function CreateTicketPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const users = await prisma.user.findMany({ select: { id: true, username: true } })

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Create New Ticket</h1>
        <p className="text-sm text-muted-foreground">Submit a new issue or task</p>
      </div>
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-6">
          <CreateTicketForm users={users as any} />
        </div>
      </div>
    </div>
  )
}
