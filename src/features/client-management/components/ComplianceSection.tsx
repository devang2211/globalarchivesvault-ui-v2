import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Check, ChevronsUpDown, X } from "lucide-react"

import * as Popover from "@radix-ui/react-popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
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

import { cn } from "@/lib/utils"
import api from "@/shared/api/client"
import type { ClientDetailsForm } from "../schema/onboarding.schema"

type IndustryChild = { id: number; name: string }
type IndustryGroup = { id: number; name: string; children: IndustryChild[] }
type Framework = { id: number; name: string; code: string }

export const ComplianceSection = () => {
  const [industries, setIndustries] = useState<IndustryGroup[]>([])
  const [frameworks, setFrameworks] = useState<Framework[]>([])
  const [openIndustry, setOpenIndustry] = useState(false)
  const [openFramework, setOpenFramework] = useState(false)

  const form = useFormContext<ClientDetailsForm>()

  useEffect(() => {
    const load = async () => {
      try {
        const [indRes, fwRes] = await Promise.all([
          api.get("/api/taxonomy/industries-with-institutions"),
          api.get("/api/Lookups/regulatory-frameworks"),
        ])
        setIndustries(indRes.data.data || [])
        setFrameworks(fwRes.data.data || [])
      } catch {
        setIndustries([])
        setFrameworks([])
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-5">

      {/* TAXONOMY LEVEL 2 — multilevel combobox */}
      <div id="field-taxonomyLevel2Id" tabIndex={-1} className="outline-none">
      <FormField
        control={form.control}
        name="taxonomyLevel2Id"
        render={({ field, fieldState }) => {
          const selectedChild = industries
            .flatMap((g) => g.children)
            .find((c) => c.id === field.value)

          const selectedParent = industries.find((g) =>
            g.children.some((c) => c.id === field.value)
          )

          return (
            <FormItem>
              <FormLabel>Industry / Institution <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Popover.Root
                  open={openIndustry}
                  onOpenChange={(open) => {
                    setOpenIndustry(open)
                    if (!open) field.onBlur()
                  }}
                >
                  <Popover.Trigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "h-9 w-full flex items-center justify-between rounded-md border px-3 text-sm bg-background hover:bg-muted transition",
                        fieldState.invalid ? "border-destructive" : "border-border"
                      )}
                    >
                      <span className="truncate text-left">
                        {selectedChild
                          ? `${selectedParent?.name} / ${selectedChild.name}`
                          : "Select industry / institution"}
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
                        <CommandInput placeholder="Search..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>

                          {industries.map((group) => (
                            <CommandGroup key={group.id} heading={group.name}>
                              {group.children.map((child) => (
                                <CommandItem
                                  key={child.id}
                                  onSelect={() => {
                                    field.onChange(child.id)
                                    field.onBlur()
                                    setOpenIndustry(false)
                                  }}
                                  className="pl-5"
                                >
                                  {child.name}
                                  {field.value === child.id && (
                                    <Check className="ml-auto h-4 w-4" />
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
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
      </div>

      {/* REGULATORY FRAMEWORKS — multi-select with chips */}
      <div id="field-regulatoryFrameworkIds" tabIndex={-1} className="outline-none">
      <FormField
        control={form.control}
        name="regulatoryFrameworkIds"
        render={({ field, fieldState }) => {
          const selected: number[] = field.value ?? []

          return (
            <FormItem>
              <FormLabel>Regulatory Frameworks <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Popover.Root
                  open={openFramework}
                  onOpenChange={(open) => {
                    setOpenFramework(open)
                    if (!open) field.onBlur()
                  }}
                >
                  <Popover.Trigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "w-full min-h-[36px] flex flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5 text-sm bg-background hover:bg-muted transition",
                        fieldState.invalid ? "border-destructive" : "border-border"
                      )}
                    >
                      {selected.length === 0 ? (
                        <span className="text-muted-foreground">Select frameworks</span>
                      ) : (
                        selected.map((id) => {
                          const fw = frameworks.find((f) => f.id === id)
                          if (!fw) return null
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs font-medium"
                            >
                              {fw.name}
                              <X
                                className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  field.onChange(selected.filter((x) => x !== id))
                                  field.onBlur()
                                }}
                              />
                            </span>
                          )
                        })
                      )}
                      <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50 shrink-0" />
                    </button>
                  </Popover.Trigger>

                  <Popover.Portal>
                    <Popover.Content
                      sideOffset={6}
                      className="z-50 w-[var(--radix-popover-trigger-width)] rounded-md border border-border bg-background shadow-md p-0"
                    >
                      <Command>
                        <CommandInput placeholder="Search frameworks..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>

                          {frameworks.map((fw) => {
                            const active = selected.includes(fw.id)
                            return (
                              <CommandItem
                                key={fw.id}
                                onSelect={() => {
                                  field.onChange(
                                    active
                                      ? selected.filter((x) => x !== fw.id)
                                      : [...selected, fw.id]
                                  )
                                }}
                              >
                                {fw.name}
                                {active && <Check className="ml-auto h-4 w-4" />}
                              </CommandItem>
                            )
                          })}
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
      </div>

    </div>
  )
}
