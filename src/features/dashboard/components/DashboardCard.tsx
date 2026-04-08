import { cn } from "@/lib/utils"

type Props = {
  title: string
  value: string
  className?: string
}

export const DashboardCard = ({ title, value, className }: Props) => {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background p-4",
        "flex flex-col gap-1",
        className
      )}
    >
      <span className="text-sm text-muted-foreground">
        {title}
      </span>

      <span className="text-lg font-semibold tracking-tight">
        {value}
      </span>
    </div>
  )
}