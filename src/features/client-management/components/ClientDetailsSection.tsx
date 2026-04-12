import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Check, ChevronsUpDown } from "lucide-react"

import * as Popover from "@radix-ui/react-popover"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

import api from "@/shared/api/client"
import type { ClientDetailsForm } from "../schema/onboarding.schema"

type Timezone = {
  id: number
  displayName: string
  windowsTimeZoneName: string
}

export const ClientDetailsSection = () => {
  const [timezones, setTimezones] = useState<Timezone[]>([])
  const [loadingTz, setLoadingTz] = useState(false)
  const [open, setOpen] = useState(false)

  const form = useFormContext<ClientDetailsForm>()

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
    <div className="space-y-5">

      {/* NAME */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Name <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter client name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* TIMEZONE */}
      <FormField
        control={form.control}
        name="appTimezoneId"
        render={({ field }) => {
          const selected = timezones.find((t) => t.id === field.value)
          return (
            <FormItem>
              <FormLabel>Time Zone</FormLabel>
              <FormControl>
                <Popover.Root open={open} onOpenChange={setOpen}>
                  <Popover.Trigger asChild>
                    <button
                      type="button"
                      className="h-9 w-full flex items-center justify-between rounded-md border border-border px-3 text-sm bg-background hover:bg-muted transition"
                    >
                      <span className={cn("truncate text-left font-normal", !selected && "text-muted-foreground")}>
                        {selected
                          ? selected.displayName
                          : loadingTz
                          ? "Loading..."
                          : "Select time zone"}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                    </button>
                  </Popover.Trigger>

                  <Popover.Portal>
                    <Popover.Content
                      sideOffset={6}
                      className="z-50 w-[var(--radix-popover-trigger-width)] rounded-md border border-border bg-background shadow-md p-0"
                    >
                      <Command>
                        <CommandInput placeholder="Search time zone..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>

                          {field.value != null && (
                            <CommandItem
                              onSelect={() => {
                                field.onChange(null)
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
                                field.onChange(tz.id)
                                setOpen(false)
                              }}
                            >
                              {tz.displayName}
                              {field.value === tz.id && (
                                <Check className="ml-auto h-4 w-4" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />

      {/* LOCATION */}
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="New York, NY" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* CONTACT EMAIL */}
      <FormField
        control={form.control}
        name="contactEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="email@company.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* CONTACT PHONE */}
      <FormField
        control={form.control}
        name="contactPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Phone</FormLabel>
            <FormControl>
              <Input placeholder="+1 (555) 123-4567" maxLength={50} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* STATUS */}
      <FormField
        control={form.control}
        name="isActive"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <FormControl>
              <div className="flex items-center gap-3 h-9 px-3 rounded-md border border-border bg-background">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <span
                  className={cn(
                    "text-sm transition-colors",
                    field.value ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {field.value ? "Active" : "Inactive"}
                </span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    </div>
  )
}
