import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TicketCheck, Clock, CheckCircle2, AlertTriangle, Activity } from "lucide-react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import type { StatCard } from "@/components/dashboard/stats-cards"
import { TicketsLineChart } from "@/components/dashboard/tickets-chart"
import type { DayData } from "@/components/dashboard/tickets-chart"
import { CategoryDonutChart } from "@/components/dashboard/category-chart"
import type { CategoryItem } from "@/components/dashboard/category-chart"
import { TicketsTable } from "@/components/dashboard/tickets-table"
import type { TicketRow } from "@/components/dashboard/tickets-table"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import type { ActivityItem } from "@/components/dashboard/activity-feed"
import { PriorityBars } from "@/components/dashboard/priority-bars"
import type { PriorityData } from "@/components/dashboard/priority-bars"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const thirtyDaysBefore = new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalTickets,
    openCount,
    inProgressCount,
    resolvedCount,
    overdueCount,
    prevMonthTotal,
    prevMonthOpen,
    prevMonthInProgress,
    prevMonthResolved,
    prevMonthOverdue,
    myTicketRows,
    categories,
    activities,
    openByPriority,
    last7Days,
  ] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: "open" } }),
    prisma.ticket.count({ where: { status: "in_progress" } }),
    prisma.ticket.count({ where: { status: "resolved" } }),
    prisma.ticket.count({ where: { dueDate: { lt: now }, status: { notIn: ["resolved", "closed"] } } }),
    prisma.ticket.count({ where: { createdAt: { lt: thirtyDaysAgo, gte: thirtyDaysBefore } } }),
    prisma.ticket.count({ where: { status: "open", createdAt: { lt: thirtyDaysAgo, gte: thirtyDaysBefore } } }),
    prisma.ticket.count({ where: { status: "in_progress", createdAt: { lt: thirtyDaysAgo, gte: thirtyDaysBefore } } }),
    prisma.ticket.count({ where: { status: "resolved", createdAt: { lt: thirtyDaysAgo, gte: thirtyDaysBefore } } }),
    prisma.ticket.count({ where: { dueDate: { lt: thirtyDaysAgo }, status: { notIn: ["resolved", "closed"] }, createdAt: { lt: thirtyDaysAgo, gte: thirtyDaysBefore } } }),
    prisma.ticket.findMany({
      where: { assignedToId: parseInt(session.user.id) },
      include: { createdBy: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.ticket.groupBy({ by: ["category"], _count: true }),
    prisma.activity.findMany({
      include: { ticket: { select: { title: true } }, user: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.ticket.groupBy({ by: ["priority"], where: { status: { notIn: ["resolved", "closed"] } }, _count: true }),
    (() => {
      const days: DayData[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
        days.push({ date: dayStart.toISOString(), label: dayStart.toLocaleDateString(undefined, { weekday: "short" }), Created: 0, Resolved: 0 })
      }
      return Promise.all(
        days.map(async (day, idx) => {
          const created = await prisma.ticket.count({ where: { createdAt: { gte: new Date(day.date), lt: new Date(new Date(day.date).getTime() + 24 * 60 * 60 * 1000) } } })
          const resolved = await prisma.ticket.count({ where: { updatedAt: { gte: new Date(day.date), lt: new Date(new Date(day.date).getTime() + 24 * 60 * 60 * 1000) }, status: "resolved" } })
          return { ...day, Created: created, Resolved: resolved }
        })
      )
    })(),
  ])

  function calcTrend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const statCards: StatCard[] = [
    { title: "Total Tickets", value: totalTickets, icon: <TicketCheck className="size-4 text-white" />, trend: calcTrend(totalTickets, prevMonthTotal), color: "bg-blue-500" },
    { title: "Open", value: openCount, icon: <Activity className="size-4 text-white" />, trend: calcTrend(openCount, prevMonthOpen), color: "bg-amber-500" },
    { title: "In Progress", value: inProgressCount, icon: <Clock className="size-4 text-white" />, trend: calcTrend(inProgressCount, prevMonthInProgress), color: "bg-purple-500" },
    { title: "Resolved", value: resolvedCount, icon: <CheckCircle2 className="size-4 text-white" />, trend: calcTrend(resolvedCount, prevMonthResolved), color: "bg-emerald-500" },
    { title: "Overdue", value: overdueCount, icon: <AlertTriangle className="size-4 text-white" />, trend: calcTrend(overdueCount, prevMonthOverdue), color: "bg-red-500" },
  ]

  const categoryData: CategoryItem[] = categories.map((c) => ({
    name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    value: c._count,
  }))
  if (categoryData.length === 0) categoryData.push({ name: "None", value: 1 })

  const myTickets: TicketRow[] = myTicketRows.map((t) => ({
    id: t.id,
    title: t.title,
    requester: t.createdBy?.username || "Unknown",
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate,
  }))

  const activityItems: ActivityItem[] = activities.map((a) => ({
    id: a.id,
    action: a.action,
    ticketId: a.ticketId,
    ticketTitle: a.ticket?.title || "",
    username: a.user?.username || "System",
    createdAt: a.createdAt,
  }))

  const priorityMap: Record<string, string> = { critical: "bg-red-500", high: "bg-amber-500", medium: "bg-blue-500", low: "bg-green-500" }
  const priorityOrder = ["critical", "high", "medium", "low"]
  const priorityData: PriorityData[] = priorityOrder.map((p) => ({
    priority: p,
    count: openByPriority.find((o) => o.priority === p)?._count || 0,
    color: priorityMap[p] || "bg-zinc-500",
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Welcome back, {session.user.name || "User"}!</h1>
        <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your tickets today.</p>
      </div>

      <StatsCards cards={statCards} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TicketsLineChart data={last7Days} />
        <CategoryDonutChart data={categoryData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TicketsTable tickets={myTickets} />
        </div>
        <div className="space-y-6">
          <PriorityBars data={priorityData} overdueCount={overdueCount} />
          <ActivityFeed activities={activityItems} />
        </div>
      </div>
    </div>
  )
}
