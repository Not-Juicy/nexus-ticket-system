import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

const categories = ["hardware", "software", "network", "access", "other"]
const priorities = ["low", "medium", "high", "critical"]
const statuses = ["open", "in_progress", "resolved", "closed"]

const ticketTemplates = [
  { title: "VPN connection timeout after update", description: "Unable to connect to VPN since the latest security patch. Connection times out after 30 seconds.", category: "network", priority: "high" },
  { title: "Printer not responding on floor 3", description: "The HP LaserJet on floor 3 shows offline status. Already tried power cycling.", category: "hardware", priority: "medium" },
  { title: "Email signature update request", description: "Please update my email signature to include the new company logo and branding.", category: "software", priority: "low" },
  { title: "New employee onboarding - laptop setup", description: "Need a new laptop configured for the new hire starting next Monday.", category: "hardware", priority: "high" },
  { title: "Database connection error in CRM", description: "CRM system returning 503 errors when accessing customer records.", category: "software", priority: "critical" },
  { title: "Access to shared drive denied", description: "Unable to access the Marketing shared drive. Was working yesterday.", category: "access", priority: "medium" },
  { title: "WiFi connectivity issues in conference room B", description: "Multiple users reporting dropped connections in conference room B.", category: "network", priority: "high" },
  { title: "Software license renewal", description: "Adobe Creative Cloud licenses expiring next month. Need to renew for 5 users.", category: "software", priority: "low" },
  { title: "Monitor flickering issue", description: "Dell monitor intermittently flickers. Connected via DisplayPort.", category: "hardware", priority: "medium" },
  { title: "New user account creation", description: "Please create accounts for 3 new interns starting next week.", category: "access", priority: "medium" },
  { title: "Server backup failure alert", description: "Nightly backup job failing with exit code 1. Needs investigation.", category: "software", priority: "critical" },
  { title: "Keyboard replacement request", description: "Mechanical keyboard with worn-out keys. Requesting replacement.", category: "hardware", priority: "low" },
  { title: "Firewall rule update", description: "Need to whitelist new vendor IP range for API integration.", category: "network", priority: "high" },
  { title: "Password reset not working", description: "Self-service password reset sends link but doesn't actually reset.", category: "access", priority: "high" },
  { title: "Video conference setup for all-hands meeting", description: "Need AV setup in the main auditorium for the quarterly all-hands.", category: "hardware", priority: "medium" },
]

const seedNames = ["Alice", "Bob", "Charlie", "Diana", "Eve"]
const actions = ["created", "commented", "status_changed", "assigned"]

export async function GET() {
  try {
    const existing = await prisma.user.findUnique({ where: { username: "admin" } })
    if (existing) {
      const count = await prisma.ticket.count()
      return Response.json({ message: `Already seeded. ${count} tickets exist.` })
    }

    const hashedPassword = await hash("admin123", 10)

    const admin = await prisma.user.create({
      data: {
        username: "admin",
        password: hashedPassword,
        email: "admin@nexus.local",
        role: "admin",
      },
    })

    const agentUsers = await Promise.all(
      seedNames.map((name, i) =>
        prisma.user.create({
          data: {
            username: name.toLowerCase(),
            password: hashedPassword,
            email: `${name.toLowerCase()}@nexus.local`,
            role: i === 0 ? "admin" : "member",
          },
        })
      )
    )

    const allUsers = [admin, ...agentUsers]

    const now = new Date()
    const tickets = await Promise.all(
      ticketTemplates.map(async (t, i) => {
        const daysAgo = Math.floor(Math.random() * 14)
        const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const hasDueDate = Math.random() > 0.3
        const dueDate = hasDueDate ? new Date(createdAt.getTime() + (3 + Math.floor(Math.random() * 14)) * 24 * 60 * 60 * 1000) : null

        return prisma.ticket.create({
          data: {
            title: t.title,
            description: t.description,
            status,
            priority: t.priority,
            category: t.category,
            dueDate,
            createdAt,
            createdById: allUsers[Math.floor(Math.random() * allUsers.length)].id,
            assignedToId: Math.random() > 0.3 ? allUsers[Math.floor(Math.random() * allUsers.length)].id : null,
          },
        })
      })
    )

    const activityData: { action: string; ticketId: number; userId: number; createdAt: Date }[] = []
    for (const ticket of tickets) {
      const numActivities = 1 + Math.floor(Math.random() * 3)
      for (let j = 0; j < numActivities; j++) {
        const daysAgo = Math.floor(Math.random() * 13)
        activityData.push({
          action: actions[Math.floor(Math.random() * actions.length)],
          ticketId: ticket.id,
          userId: allUsers[Math.floor(Math.random() * allUsers.length)].id,
          createdAt: new Date(ticket.createdAt.getTime() + daysAgo * 24 * 60 * 60 * 1000 + Math.floor(Math.random() * 3600000)),
        })
      }
    }
    await prisma.activity.createMany({ data: activityData })

    const commentsData: { body: string; ticketId: number; userId: number }[] = []
    for (const ticket of tickets) {
      if (Math.random() > 0.5) {
        commentsData.push({
          body: "Looking into this now. Will update shortly.",
          ticketId: ticket.id,
          userId: allUsers[Math.floor(Math.random() * allUsers.length)].id,
        })
      }
    }
    await prisma.comment.createMany({ data: commentsData })

    return Response.json({
      message: `Seeded: ${allUsers.length} users, ${tickets.length} tickets, ${activityData.length} activities, ${commentsData.length} comments`,
    })
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
