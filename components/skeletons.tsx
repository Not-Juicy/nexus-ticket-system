export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-muted rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="h-4 w-20 bg-muted rounded mb-3" />
            <div className="h-8 w-16 bg-muted rounded mb-2" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <div className="h-5 w-36 bg-muted rounded mb-2" />
          <div className="h-4 w-24 bg-muted rounded mb-4" />
          <div className="h-60 bg-muted rounded" />
        </div>
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <div className="h-5 w-36 bg-muted rounded mb-2" />
          <div className="h-4 w-24 bg-muted rounded mb-4" />
          <div className="h-60 bg-muted rounded" />
        </div>
      </div>
    </div>
  )
}

export function TicketListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-32 bg-muted rounded" />
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <div className="h-9 w-32 bg-muted rounded" />
            <div className="h-9 w-32 bg-muted rounded" />
            <div className="h-9 w-40 bg-muted rounded" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b">
            <div className="h-4 w-12 bg-muted rounded" />
            <div className="h-4 flex-1 bg-muted rounded" />
            <div className="h-5 w-20 bg-muted rounded" />
            <div className="h-5 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
