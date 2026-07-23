"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { hash } from "bcryptjs"

export async function createTicket(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const priority = (formData.get("priority") as string) || "medium"
  const assignedTo = formData.get("assigned_to") as string

  if (!title?.trim()) throw new Error("Title is required")

  await prisma.ticket.create({
    data: {
      title: title.trim(),
      description: description || "",
      priority,
      createdById: parseInt(session.user.id),
      assignedToId: assignedTo ? parseInt(assignedTo) : null,
    },
  })

  revalidatePath("/tickets")
  revalidatePath("/dashboard")
}

export async function updateTicketStatus(ticketId: number, status: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const valid = ["open", "in_progress", "resolved", "closed"]
  if (!valid.includes(status)) throw new Error("Invalid status")

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
  })

  revalidatePath(`/tickets/${ticketId}`)
  revalidatePath("/tickets")
  revalidatePath("/dashboard")
}

export async function updateTicketPriority(ticketId: number, priority: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const valid = ["low", "medium", "high", "critical"]
  if (!valid.includes(priority)) throw new Error("Invalid priority")

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { priority },
  })

  revalidatePath(`/tickets/${ticketId}`)
}

export async function assignTicket(ticketId: number, assignedToId: string) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      assignedToId: assignedToId ? parseInt(assignedToId) : null,
    },
  })

  revalidatePath(`/tickets/${ticketId}`)
  revalidatePath("/tickets")
}

export async function addComment(ticketId: number, formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  const body = formData.get("body") as string
  if (!body?.trim()) throw new Error("Comment cannot be empty")

  await prisma.comment.create({
    data: {
      body: body.trim(),
      ticketId,
      userId: parseInt(session.user.id),
    },
  })

  revalidatePath(`/tickets/${ticketId}`)
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

  const hashedPassword = await hash(password, 10)

  await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      email: email || null,
      role,
    },
  })

  revalidatePath("/users")
}
