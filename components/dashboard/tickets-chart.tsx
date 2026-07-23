"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"

type DayData = {
  date: string
  label: string
  Created: number
  Resolved: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function TicketsLineChart({ data }: { data: DayData[] }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="px-5 py-4 border-b">
        <h3 className="font-semibold">Tickets Overview</h3>
        <p className="text-xs text-muted-foreground">Last 7 days</p>
      </div>
      <div className="p-4">
        <div className="flex gap-4 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-sm bg-blue-500" />
            <span>Created</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2.5 rounded-sm bg-emerald-500" />
            <span>Resolved</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="stroke-muted/50" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="Created" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="Resolved" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export type { DayData }
