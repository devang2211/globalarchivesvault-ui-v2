import { useEffect, useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import api from "@/shared/api/client"

import * as Popover from "@radix-ui/react-popover"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command"

import { Check, ChevronsUpDown, X } from "lucide-react"
import { Label } from "@/components/ui/label"

/* ================= TYPES ================= */

type L1 = { id: number; name: string }
type L2 = {
  id: number
  name: string
  taxonomyLevel1Id: number
}

type Framework = {
  id: number
  name: string
  code: string
}

/* ================= COMPONENT ================= */

export const ComplianceSection = () => {
  const { setValue, watch } = useFormContext()

  const industryId = watch("industryId")
  const frameworkIds = watch("frameworkIds") || []

  const [l1, setL1] = useState<L1[]>([])
  const [l2, setL2] = useState<L2[]>([])
  const [frameworkList, setFrameworkList] = useState<Framework[]>([])

  const [openIndustry, setOpenIndustry] = useState(false)
  const [openFramework, setOpenFramework] = useState(false)

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    const load = async () => {
      try {
        const [l1Res, l2Res, fwRes] = await Promise.all([
          api.get("/api/Taxonomy/level1"),
          api.get("/api/Taxonomy/level2"),
          api.get("/api/Lookups/regulatory-frameworks"),
        ])

        /* 🔥 NORMALIZE L1 */
        const level1 = (l1Res.data.data || []).map((x: any) => ({
          id: x.id ?? x.Id,
          name: x.name ?? x.Name,
        }))

        /* 🔥 NORMALIZE L2 */
        const level2 = (l2Res.data.data || []).map((x: any) => ({
          id: x.id ?? x.Id,
          name: x.name ?? x.Name,
          taxonomyLevel1Id:
            x.taxonomyLevel1Id ?? x.TaxonomyLevel1Id,
        }))

        setL1(level1)
        setL2(level2)
        setFrameworkList(fwRes.data.data || [])
      } catch {
        setL1([])
        setL2([])
        setFrameworkList([])
      }
    }

    load()
  }, [])

  /* ================= GROUP DATA ================= */

  const grouped = useMemo(() => {
    return l1.map((group) => ({
      ...group,
      children: l2.filter(
        (c) =>
          String(c.taxonomyLevel1Id) === String(group.id)
      ),
    }))
  }, [l1, l2])

  const selectedIndustry = l2.find(
    (x) => String(x.id) === String(industryId)
  )

  const parentIndustry = l1.find(
    (g) =>
      String(g.id) ===
      String(selectedIndustry?.taxonomyLevel1Id)
  )

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">

      {/* ================= INDUSTRY ================= */}
      <div className="space-y-2">
        <Label>Industry / Institution</Label>

        <Popover.Root
          open={openIndustry}
          onOpenChange={setOpenIndustry}
        >
          <Popover.Trigger asChild>
            <button
              className="
                w-full h-9 flex items-center justify-between
                rounded-md border border-border px-3 text-sm
                bg-background hover:bg-muted transition
              "
            >
              <span className="text-muted-foreground/80 font-normal">
                {selectedIndustry
                  ? `${parentIndustry?.name || "Unknown"} / ${selectedIndustry.name}`
                  : "Select industry / institution"}
              </span>

              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={6}
              className="
                z-50 w-[var(--radix-popover-trigger-width)]
                border border-border bg-background rounded-md shadow-md p-0
              "
            >
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results</CommandEmpty>

{grouped.map((group) => (
  <CommandGroup
    key={group.id}
    heading={group.name}
    className="px-0"
  >
    {/* L1 HEADER */}
    {/* <div
      className="
        px-3 py-1.5 text-xs font-semibold
        text-muted-foreground uppercase tracking-wide
      "
    >
      {group.name}
    </div> */}

    {/* L2 ITEMS */}
    {group.children.map((item) => (
      <CommandItem
        key={item.id}
        onSelect={() => {
          setValue("industryId", item.id, {
            shouldValidate: true,
          })
          setOpenIndustry(false)
        }}
className="
  pl-6 pr-3 text-sm flex items-center
  cursor-pointer
  data-[highlighted]:bg-muted
  data-[highlighted]:text-foreground
"
      >
        {/* subtle bullet */}
        <span className="mr-2 text-muted-foreground">•</span>

        {item.name}

        {String(industryId) === String(item.id) && (
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
      </div>

      {/* ================= FRAMEWORKS ================= */}
      <div className="space-y-2">
        <Label>Regulatory Frameworks</Label>

        <Popover.Root
          open={openFramework}
          onOpenChange={setOpenFramework}
        >
          <Popover.Trigger asChild>
            <button
              className="
                w-full min-h-[36px] flex flex-wrap items-center gap-2
                rounded-md border border-border px-2 py-1 text-sm
                bg-background hover:bg-muted transition
              "
            >
              {frameworkIds.length === 0 && (
                <span className="text-muted-foreground/80 font-normal">
                  Select frameworks
                </span>
              )}

              {frameworkIds.map((id: number) => {
                const f = frameworkList.find(
                  (x) => x.id === id
                )
                if (!f) return null

                return (
                  <span
                    key={id}
                    className="
                      flex items-center gap-1 px-2 py-0.5 rounded-md
                      bg-muted text-xs
                    "
                  >
                    {f.code}

                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setValue(
                          "frameworkIds",
                          frameworkIds.filter(
                            (x: number) => x !== id
                          ),
                          { shouldValidate: true }
                        )
                      }}
                    />
                  </span>
                )
              })}

              <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="start"
              sideOffset={6}
              className="
                z-50 w-[var(--radix-popover-trigger-width)]
                border border-border bg-background rounded-md shadow-md p-0
              "
            >
              <Command>
                <CommandInput placeholder="Search frameworks..." />
                <CommandList>
                  <CommandEmpty>No results</CommandEmpty>

                  {frameworkList.map((item) => {
                    const active =
                      frameworkIds.includes(item.id)

                    return (
<CommandItem
  key={item.id}
  onSelect={() => {
    const next = active
      ? frameworkIds.filter((x: number) => x !== item.id)
      : [...frameworkIds, item.id]

    setValue("frameworkIds", next, {
      shouldValidate: true,
    })
  }}
  className="
    cursor-pointer
    data-[highlighted]:bg-muted
    data-[highlighted]:text-foreground
  "
>
                        {item.name}

                        {active && (
                          <Check className="ml-auto h-4 w-4" />
                        )}
                      </CommandItem>
                    )
                  })}
                </CommandList>
              </Command>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  )
}