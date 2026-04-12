import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import * as Popover from "@radix-ui/react-popover"
import { Calendar } from "@/components/ui/calendar"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"

import api from "@/shared/api/client"
import type { ClientDetailsForm } from "../schema/onboarding.schema"

type Tier = { id: number; name: string }

export const SubscriptionSection = () => {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [openDate, setOpenDate] = useState(false)

  const handleDateOpenChange = (open: boolean, onBlur: () => void) => {
    setOpenDate(open)
    if (!open) onBlur()
  }

  const form = useFormContext<ClientDetailsForm>()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/tier")
        setTiers(res.data.data || [])
      } catch {
        setTiers([])
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-5">

      {/* PRICING TIER */}
      <FormField
        control={form.control}
        name="tierId"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>
              Pricing Tier <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <div className={cn(
                "inline-flex w-full rounded-md border overflow-hidden",
                fieldState.invalid ? "border-destructive" : "border-border"
              )}>
                {tiers.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => { field.onChange(tier.id); field.onBlur() }}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm font-normal transition cursor-pointer",
                      "border-r last:border-r-0 border-border",
                      field.value === tier.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground hover:bg-muted"
                    )}
                  >
                    {tier.name}
                  </button>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* START DATE */}
      <FormField
        control={form.control}
        name="startDate"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>
              Start Date <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Popover.Root open={openDate} onOpenChange={(open) => handleDateOpenChange(open, field.onBlur)}>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "h-9 w-full flex items-center justify-between rounded-md border px-3 text-sm bg-background hover:bg-muted transition cursor-pointer",
                      fieldState.invalid ? "border-destructive" : "border-border"
                    )}
                  >
                    {field.value ? (
                      <span className="font-normal">{format(new Date(field.value), "MMM d, yyyy")}</span>
                    ) : (
                      <span className="text-muted-foreground font-normal">MMM D, YYYY</span>
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
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (!date) return
                        field.onChange(date.toISOString())
                        field.onBlur()
                        setOpenDate(false)
                      }}
                      autoFocus
                    />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    </div>
  )
}
