import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const existing = await prisma.user.findUnique({ where: { username: "admin" } })
    if (existing) {
      return Response.json({ message: "Admin user already exists" })
    }

    const hashedPassword = await hash("admin123", 10)
    await prisma.user.create({
      data: {
        username: "admin",
        password: hashedPassword,
        email: "admin@nexus.local",
        role: "admin",
      },
    })

    return Response.json({ message: "Admin user created: admin / admin123" })
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
