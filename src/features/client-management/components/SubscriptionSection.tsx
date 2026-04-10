import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import api from "@/shared/api/client"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import * as Popover from "@radix-ui/react-popover"
import { CalendarIcon } from "lucide-react"

type Tier = {
  id: number
  name: string
}

export const SubscriptionSection = () => {
  const { setValue, watch, formState: { errors } } = useFormContext()

  const selectedTier = watch("tierId")
  const startDate = watch("startDate")

  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(false)

  const [openDate, setOpenDate] = useState(false)

  /* ===============================
     LOAD TIERS
  =============================== */
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await api.get("/api/tier")
        setTiers(res.data.data || [])
      } catch {
        setTiers([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

return (
  <div className="rounded-xl border border-border bg-background p-5 space-y-4">

    {/* HEADER */}
    <div>
      <h3 className="text-base font-semibold">Subscription</h3>
      <p className="text-sm text-muted-foreground">
        Configure pricing tier and subscription start date
      </p>
    </div>

    {/* EXISTING FORM CONTENT */}
    <div className="space-y-4">

      {/* ===============================
         PRICING TIER
      =============================== */}
<div className="space-y-2">
  <Label>Pricing Tier *</Label>

  <div className="inline-flex w-full rounded-md border border-border overflow-hidden">
    {tiers.map((tier, idx) => {
      const active = selectedTier === tier.id

      return (
        <button
          key={tier.id}
          type="button"
          onClick={() =>
            setValue("tierId", tier.id, { shouldValidate: true })
          }
          className={cn(
            "flex-1 px-3 py-2 text-sm font-medium transition",
            "cursor-pointer",
            "border-r last:border-r-0 border-border",

            active
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground hover:bg-muted"
          )}
        >
          {tier.name}
        </button>
      )
    })}
  </div>

  {errors.tierId && (
    <p className="text-xs text-destructive">
      Pricing tier is required
    </p>
  )}
</div>

      {/* ===============================
         START DATE
      =============================== */}
<div className="space-y-2">
  <Label>Start Date *</Label>

  <Popover.Root open={openDate} onOpenChange={setOpenDate}>
    <Popover.Trigger asChild>
      <button
        type="button"
        className="
          w-full h-9 flex items-center justify-between
          rounded-md border border-border px-3 text-sm
          bg-background hover:bg-muted transition
          cursor-pointer
        "
      >
        {startDate ? (
          <span>{format(new Date(startDate), "MM/dd/yyyy")}</span>
        ) : (
          <span className="text-muted-foreground">
            Select start date
          </span>
        )}

        <CalendarIcon className="h-4 w-4 opacity-50" />
      </button>
    </Popover.Trigger>

    <Popover.Portal>
      <Popover.Content
      align="start"
        sideOffset={6}
        className="z-50 rounded-md border border-border bg-background shadow-md p-2"
      >
        <Calendar
          mode="single"
          selected={startDate ? new Date(startDate) : undefined}
          onSelect={(date) => {
            if (!date) return

            setValue("startDate", date.toISOString(), {
              shouldValidate: true,
            })

            setOpenDate(false)
          }}
          initialFocus
        />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>

  {errors.startDate && (
    <p className="text-xs text-destructive">
      Start date is required
    </p>
  )}
</div>
    </div>

  </div>
)
}