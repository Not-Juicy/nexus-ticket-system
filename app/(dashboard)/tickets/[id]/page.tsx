import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import Link from "next/link"
import { TicketDetailClient } from "@/components/ticket-detail-client"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params
  const ticketId = parseInt(id)
  if (isNaN(ticketId)) notFound()

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      createdBy: { select: { id: true, username: true } },
      assignedTo: { select: { id: true, username: true } },
      comments: {
        include: { user: { select: { id: true, username: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!ticket) notFound()

  const users = await prisma.user.findMany({ select: { id: true, username: true } })

  return (
    <div className="space-y-4">
      <Link href="/tickets" className="inline-flex items-center gap-1 rounded-lg h-7 px-2.5 text-sm font-medium hover:bg-muted transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <TicketDetailClient ticket={ticket as any} users={users as any} currentUserId={session.user.id} />
    </div>
  )
}
