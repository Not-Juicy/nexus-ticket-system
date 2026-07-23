"use client"

import { TicketCheck, Clock, CheckCircle2, AlertTriangle, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

type StatCard = {
  title: string
  value: number
  icon: React.ReactNode
  trend: number
  color: string
}

export function StatsCards({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div key={card.title} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground font-medium">{card.title}</span>
            <div className={cn("flex size-8 items-center justify-center rounded-lg", card.color)}>
              {card.icon}
            </div>
          </div>
          <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
          <div className={cn(
            "flex items-center gap-1 mt-1 text-xs font-medium",
            card.trend >= 0 ? "text-emerald-600" : "text-red-500"
          )}>
            <span>{card.trend >= 0 ? "↑" : "↓"}</span>
            <span>{Math.abs(card.trend)}% vs last month</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export type { StatCard }
