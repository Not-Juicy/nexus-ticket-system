"use client"

import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type PriorityData = {
  priority: string
  count: number
  color: string
}

export function PriorityBars({ data, overdueCount }: { data: PriorityData[]; overdueCount: number }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="px-5 py-4 border-b">
        <h3 className="font-semibold">Open Tickets by Priority</h3>
      </div>
      <div className="p-5 space-y-4">
        {data.map((item) => (
          <div key={item.priority}>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="capitalize font-medium">{item.priority}</span>
              <span className="font-semibold tabular-nums">{item.count}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", item.color)}
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {overdueCount > 0 && (
        <div className="mx-5 mb-5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3 flex items-start gap-2">
          <AlertTriangle className="size-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Overdue Tickets</p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80">
              {overdueCount} ticket{overdueCount > 1 ? "s" : ""} past due date — needs attention
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export type { PriorityData }
