"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#6b7280"]

type CategoryItem = {
  name: string
  value: number
}

export function CategoryDonutChart({ data }: { data: CategoryItem[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="px-5 py-4 border-b">
        <h3 className="font-semibold">Tickets by Category</h3>
        <p className="text-xs text-muted-foreground">Distribution across categories</p>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mt-2">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="size-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-medium ml-auto">{total > 0 ? Math.round((item.value / total) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export type { CategoryItem }
