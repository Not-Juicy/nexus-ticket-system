"use client"

import { MessageSquare, PlusCircle, ArrowRightCircle, UserPlus, Clock } from "lucide-react"

const actionIcons: Record<string, React.ReactNode> = {
  created: <PlusCircle className="size-3.5" />,
  commented: <MessageSquare className="size-3.5" />,
  status_changed: <ArrowRightCircle className="size-3.5" />,
  assigned: <UserPlus className="size-3.5" />,
}

const actionColors: Record<string, string> = {
  created: "bg-blue-500",
  commented: "bg-emerald-500",
  status_changed: "bg-amber-500",
  assigned: "bg-purple-500",
}

type ActivityItem = {
  id: number
  action: string
  ticketId: number
  ticketTitle: string
  username: string
  createdAt: Date
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="px-5 py-4 border-b">
        <h3 className="font-semibold">Recent Activity</h3>
      </div>
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="divide-y">
          {activities.map((a) => {
            const icon = actionIcons[a.action] || <Clock className="size-3.5" />
            const color = actionColors[a.action] || "bg-zinc-500"
            return (
              <div key={a.id} className="flex gap-3 px-5 py-3">
                <div className={`flex size-7 shrink-0 items-center justify-center rounded-full text-white ${color} mt-0.5`}>
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{a.username}</span>{" "}
                    {a.action === "created" && "created ticket"}
                    {a.action === "commented" && "commented on ticket"}
                    {a.action === "status_changed" && "updated ticket status"}
                    {a.action === "assigned" && "was assigned to ticket"}
                    {!"created,commented,status_changed,assigned".includes(a.action) && a.action.replace(/_/g, " ")}
                    {" "}
                    <span className="font-mono text-xs text-muted-foreground">#{a.ticketId}</span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{a.ticketTitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(a.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export type { ActivityItem }
