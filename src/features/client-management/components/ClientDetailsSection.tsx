import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { Check, ChevronsUpDown } from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command"

import api from "@/shared/api/client"

type Timezone = {
  id: number
  displayName: string
  windowsTimeZoneName: string
}

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  timezone: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  location: z.string().max(200).optional(),
  email: z.string().email("Invalid email").max(320).optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
})

type FormValues = z.infer<typeof schema>

export const ClientDetailsSection = () => {
  const [timezones, setTimezones] = useState<Timezone[]>([])
  const [loadingTz, setLoadingTz] = useState(false)
  const [open, setOpen] = useState(false)

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "active",
    },
  })

  const form = watch()

  // ✅ API CALL
  useEffect(() => {
    const load = async () => {
      setLoadingTz(true)
      try {
        const res = await api.get("/api/Lookups/app-timezones")
        setTimezones(res.data.data || [])
      } catch {
        setTimezones([])
      } finally {
        setLoadingTz(false)
      }
    }

    load()
  }, [])

  return (
    <div className="rounded-xl border border-border bg-background p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h3 className="text-base font-semibold">Client Details</h3>
        <p className="text-sm text-muted-foreground">
          Basic organization information
        </p>
      </div>

      {/* FORM */}
      <div className="space-y-5">

        {/* NAME */}
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input {...register("name")} placeholder="Enter client name" />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* STATUS */}
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={form.status === "active" ? "default" : "outline"}
              onClick={() => setValue("status", "active")}
            >
              Active
            </Button>

            <Button
              size="sm"
              variant={form.status === "inactive" ? "default" : "outline"}
              onClick={() => setValue("status", "inactive")}
            >
              Inactive
            </Button>
          </div>
        </div>

        {/* TIMEZONE */}
<div className="space-y-2">
  <Label>Time Zone</Label>

  <Popover.Root open={open} onOpenChange={setOpen}>
    <Popover.Trigger asChild>
      <button
        className="
          h-9 w-full flex items-center justify-between
          rounded-md border border-border px-3 text-sm
          bg-background hover:bg-muted transition
        "
      >
        <span className="truncate">
          {form.timezone
            ? timezones.find(
                (t) => t.windowsTimeZoneName === form.timezone
              )?.displayName
            : loadingTz
            ? "Loading..."
            : "Select time zone"}
        </span>

        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </button>
    </Popover.Trigger>

    <Popover.Portal>
      <Popover.Content
        sideOffset={6}
        className="
          z-50 w-[var(--radix-popover-trigger-width)]
          rounded-md border border-border bg-background shadow-md p-0
        "
      >
        <Command>
          <CommandInput placeholder="Search time zone..." />

          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            {/* CLEAR OPTION */}
            {form.timezone && (
              <CommandItem
                onSelect={() => {
                  setValue("timezone", "")
                  setOpen(false)
                }}
                className="text-muted-foreground"
              >
                Clear selection
              </CommandItem>
            )}

            {timezones.map((tz) => (
              <CommandItem
                key={tz.id}
                onSelect={() => {
                  setValue("timezone", tz.windowsTimeZoneName)
                  setOpen(false)
                }}
              >
                {tz.displayName}

                {form.timezone === tz.windowsTimeZoneName && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
</div>

        {/* LOCATION */}
        <div className="space-y-2">
          <Label>Location</Label>
          <Input {...register("location")} placeholder="Enter location" />
        </div>

        {/* EMAIL */}
        <div className="space-y-2">
          <Label>Contact Email</Label>
          <Input {...register("email")} placeholder="email@company.com" />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* PHONE */}
        <div className="space-y-2">
          <Label>Contact Phone</Label>
          <Input {...register("phone")} placeholder="(555) 123-4567" />
        </div>

      </div>
    </div>
  )
}