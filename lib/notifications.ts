import { prisma } from "@/lib/prisma"

type NotificationEvent = {
  type: "ticket_created" | "ticket_assigned" | "status_changed" | "comment_added"
  ticketId: number
  ticketTitle: string
  actorName: string
  assigneeEmail?: string | null
  extra?: string
}

export async function sendNotification(event: NotificationEvent) {
  if (event.assigneeEmail) {
    console.log(`[EMAIL] To: ${event.assigneeEmail}`)
    console.log(`[EMAIL] Subject: ${event.type.replace(/_/g, " ")} - ${event.ticketTitle}`)
    console.log(`[EMAIL] Body: ${event.actorName} ${event.type.replace(/_/g, " ")} ticket #${event.ticketId}${event.extra ? ` (${event.extra})` : ""}`)
  }

  await prisma.activity.create({
    data: {
      action: `notification_${event.type}`,
      ticketId: event.ticketId,
      userId: undefined as any,
    },
  }).catch(() => {})
}
