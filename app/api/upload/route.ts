import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const ticketId = parseInt(formData.get("ticketId") as string)

    if (!file || !ticketId) return Response.json({ error: "Missing file or ticketId" }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`
    const uploadDir = join(process.cwd(), "public", "uploads")
    const filePath = join(uploadDir, uniqueName)

    await mkdir(uploadDir, { recursive: true })
    await writeFile(filePath, buffer)

    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        path: `/uploads/${uniqueName}`,
        ticketId,
        userId: parseInt(session.user.id),
      },
    })

    await prisma.activity.create({
      data: { action: "file_uploaded", ticketId, userId: parseInt(session.user.id) },
    })

    return Response.json({ attachment })
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 })
  }
}
