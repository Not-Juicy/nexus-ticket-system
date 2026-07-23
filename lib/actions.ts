"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hash, compare } from "bcryptjs"
import { sendNotification } from "@/lib/notifications"

async function logActivity(ticketId: number, action: string) {
  const session = await auth()
  if (!session?.user) return
  await prisma.activity.create({
    data: { action, ticketId, userId: parseInt(session.user.id) },
  })
}

export async function createTicket(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const priority = (formData.get("priority") as string) || "medium"
  const assignedTo = formData.get("assigned_to") as string
  const category = (formData.get("category") as string) || "other"
  const dueDate = formData.get("dueDate") as string

  if (!title?.trim()) throw new Error("Title is required")

  const ticket = await prisma.ticket.create({
    data: {
      title: title.trim(),
      description: description || "",
      priority,
      category,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdById: parseInt(session.user.id),
      assignedToId: assignedTo ? parseInt(assignedTo) : null,
    },
    include: { assignedTo: { select: { email: true } } },
  })

  await logActivity(ticket.id, "created")

  if (ticket.assignedTo?.email) {
    await sendNotification({
      type: "ticket_created",
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      actorName: session.user.name || "Unknown",
      assigneeEmail: ticket.assignedTo.email,
    })
  }

  revalidatePath("/tickets")
  revalidatePath("/")
}

export async function updateTicketStatus(ticketId: number, status: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const valid = ["open", "in_progress", "resolved", "closed", "archived"]
  if (!valid.includes(status)) throw new Error("Invalid status")

  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
    include: { assignedTo: { select: { email: true } } },
  })

  await logActivity(ticketId, "status_changed")

  if (ticket.assignedTo?.email) {
    await sendNotification({
      type: "status_changed",
      ticketId,
      ticketTitle: ticket.title,
      actorName: session.user.name || "Unknown",
      assigneeEmail: ticket.assignedTo.email,
      extra: status,
    })
  }

  revalidatePath(`/tickets/${ticketId}`)
  revalidatePath("/tickets")
  revalidatePath("/")
}

export async function updateTicketPriority(ticketId: number, priority: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")
  const valid = ["low", "medium", "high", "critical"]
  if (!valid.includes(priority)) throw new Error("Invalid priority")
  await prisma.ticket.update({ where: { id: ticketId }, data: { priority } })
  revalidatePath(`/tickets/${ticketId}`)
}

export async function assignTicket(ticketId: number, assignedToId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { assignedToId: assignedToId ? parseInt(assignedToId) : null },
    include: { assignedTo: { select: { email: true, username: true } } },
  })

  await logActivity(ticketId, "assigned")

  if (ticket.assignedTo?.email) {
    await sendNotification({
      type: "ticket_assigned",
      ticketId,
      ticketTitle: ticket.title,
      actorName: session.user.name || "Unknown",
      assigneeEmail: ticket.assignedTo.email,
    })
  }

  revalidatePath(`/tickets/${ticketId}`)
  revalidatePath("/tickets")
}

export async function addComment(ticketId: number, formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const body = formData.get("body") as string
  if (!body?.trim()) throw new Error("Comment cannot be empty")

  const comment = await prisma.comment.create({
    data: { body: body.trim(), ticketId, userId: parseInt(session.user.id) },
  })

  await logActivity(ticketId, "commented")

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { assignedTo: { select: { email: true } } },
  })

  if (ticket?.assignedTo?.email) {
    await sendNotification({
      type: "comment_added",
      ticketId,
      ticketTitle: ticket.title,
      actorName: session.user.name || "Unknown",
      assigneeEmail: ticket.assignedTo.email,
    })
  }

  revalidatePath(`/tickets/${ticketId}`)
  return comment
}

export async function deleteTicket(ticketId: number) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
  if (!ticket) throw new Error("Ticket not found")
  if (ticket.createdById !== parseInt(session.user.id) && session.user.role !== "admin") {
    throw new Error("Only the creator or an admin can delete tickets")
  }

  await prisma.ticket.delete({ where: { id: ticketId } })
  revalidatePath("/tickets")
  revalidatePath("/")
}

export async function createUser(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") throw new Error("Unauthorized")

  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const email = formData.get("email") as string
  const role = (formData.get("role") as string) || "member"

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) throw new Error("Username already exists")

  await prisma.user.create({
    data: { username, password: await hash(password, 10), email: email || null, role },
  })

  revalidatePath("/users")
}

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const email = formData.get("email") as string
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string

  const user = await prisma.user.findUnique({ where: { id: parseInt(session.user.id) } })
  if (!user) throw new Error("User not found")

  if (currentPassword && newPassword) {
    const valid = await compare(currentPassword, user.password)
    if (!valid) throw new Error("Current password is incorrect")
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hash(newPassword, 10), email: email || null },
    })
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { email: email || null },
    })
  }

  revalidatePath("/profile")
}
