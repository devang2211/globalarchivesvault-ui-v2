import { Skeleton } from "@/components/ui/skeleton"

const StatCard = () => (
  <div className="rounded-lg border border-border bg-background p-5 flex flex-col gap-3">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-7 w-16" />
    <Skeleton className="h-2.5 w-32" />
  </div>
)

const WideCard = () => (
  <div className="rounded-lg border border-border bg-background p-5 flex flex-col gap-3">
    <Skeleton className="h-3 w-32" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
    <Skeleton className="h-4 w-3/5" />
    <Skeleton className="h-4 w-2/3 mt-1" />
  </div>
)

export default function DashboardPage() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your system activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard />
        <StatCard />
        <StatCard />
        <StatCard />
      </div>

      {/* Wide cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <WideCard />
        <WideCard />
      </div>

    </div>
  )
}
