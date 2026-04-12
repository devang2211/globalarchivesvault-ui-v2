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
  const isEditMode = (form.watch("id") ?? 0) > 0

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
                    if (isEditMode) return
                    setOpenIndustry(open)
                    if (!open) field.onBlur()
                  }}
                >
                  <Popover.Trigger asChild>
                    <button
                      type="button"
                      disabled={isEditMode}
                      className={cn(
                        "h-9 w-full flex items-center justify-between rounded-md border px-3 text-sm bg-background transition",
                        isEditMode ? "opacity-60 cursor-not-allowed" : "hover:bg-muted cursor-pointer",
                        fieldState.invalid ? "border-destructive" : "border-border"
                      )}
                    >
                      <span className={cn("truncate text-left text-sm font-normal not-italic", !selectedChild && "text-muted-foreground")}>
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
      <div id="field-regulatoryFrameworks" tabIndex={-1} className="outline-none">
      <FormField
        control={form.control}
        name="regulatoryFrameworks"
        render={({ field, fieldState }) => {
          const selected: { regulatoryFrameworkId: number }[] = field.value ?? []

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
                        <span className="text-muted-foreground font-normal">Select frameworks</span>
                      ) : (
                        selected.map((item) => {
                          const fw = frameworks.find((f) => f.id === item.regulatoryFrameworkId)
                          if (!fw) return null
                          return (
                            <span
                              key={item.regulatoryFrameworkId}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-xs font-normal"
                            >
                              {fw.name}
                              <X
                                className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  field.onChange(selected.filter((x) => x.regulatoryFrameworkId !== item.regulatoryFrameworkId))
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
                            const active = selected.some((x) => x.regulatoryFrameworkId === fw.id)
                            return (
                              <CommandItem
                                key={fw.id}
                                onSelect={() => {
                                  field.onChange(
                                    active
                                      ? selected.filter((x) => x.regulatoryFrameworkId !== fw.id)
                                      : [...selected, { regulatoryFrameworkId: fw.id }]
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
