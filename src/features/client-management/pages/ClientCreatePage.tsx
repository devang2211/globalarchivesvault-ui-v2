// import { useForm, FormProvider } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useNavigate } from "@tanstack/react-router"
// import { clientSchema } from "../schema/client.schema"
// import { ClientDetailsSection } from "../components/ClientDetailsSection"
// import { SubscriptionSection } from "../components/SubscriptionSection"
// import { ComplianceSection } from "../components/ComplianceSection"
// import { PlatformAccessSection } from "../components/PlatformAccessSection"

// export const ClientCreatePage = () => {
//   const navigate = useNavigate()

//   const methods = useForm({
//     resolver: zodResolver(clientSchema),
//     defaultValues: {
//       id: 0,
//       name: "",
//       status: "active",
//       location: "",
//       email: "",
//       phone: "",
//       timezoneId: null,
//       tierId: undefined,
//       startDate: "",
//       industryId: undefined,
//       frameworkIds: [],
//       permissions: [],
//     },
//   })

//   const { handleSubmit, watch } = methods

//   const tierId = watch("tierId")
//   const clientId = watch("id")

//   const onSubmit = (data: any) => {
//     console.log("FINAL PAYLOAD", data)
//   }

//   return (
//     <FormProvider {...methods}>
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

//         {/* GRID */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
//           <div className="space-y-6">
//             <ClientDetailsSection />
//             <ComplianceSection />
//           </div>

//           <div className="space-y-6">
//             <SubscriptionSection />
//             <PlatformAccessSection
//               tierId={tierId}
//               clientId={clientId}
//             />
//           </div>
//         </div>

//         {/* ACTION BAR */}
//         <div className="flex justify-center gap-4 pt-4 border-t border-border/50">
//           <button
//             type="submit"
//             className="px-6 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
//           >
//             Save Client
//           </button>

//           <button
//             type="button"
//             onClick={() => navigate({ to: "/client-management" })}
//             className="px-6 py-2 rounded-md border border-border hover:bg-muted transition cursor-pointer"
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </FormProvider>
//   )
// }

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "@tanstack/react-router"
import { clientSchema, type ClientForm } from "../schema/client.schema"

import api from "@/shared/api/client"
import permissionConfig from "@/shared/config/permissions"
import { getTierPermissions } from "@/features/tier-permissions/api/tier.api"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

import * as Popover from "@radix-ui/react-popover"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export const ClientCreatePage = () => {
  const navigate = useNavigate()

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      id: 0,
      name: "",
      status: "active",
      location: "",
      email: "",
      phone: "",
      timezoneId: null,
      tierId: undefined,
      startDate: "",
      industryId: undefined,
      frameworkIds: [],
      permissions: [],
    },
  })

  const form = watch()

  /* ===============================
     STATES
  =============================== */
  const [timezones, setTimezones] = useState<any[]>([])
  const [tiers, setTiers] = useState<any[]>([])
  const [l1, setL1] = useState<any[]>([])
  const [l2, setL2] = useState<any[]>([])
  const [frameworks, setFrameworks] = useState<any[]>([])

  const [permissionMap, setPermissionMap] = useState<Map<number, string>>(new Map())
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const [openTz, setOpenTz] = useState(false)
  const [openDate, setOpenDate] = useState(false)
  const [openIndustry, setOpenIndustry] = useState(false)
  const [openFramework, setOpenFramework] = useState(false)

  /* ===============================
     LOAD MASTER DATA
  =============================== */
  useEffect(() => {
    const load = async () => {
      const [tz, tier, l1Res, l2Res, fw, perm] = await Promise.all([
        api.get("/api/Lookups/app-timezones"),
        api.get("/api/tier"),
        api.get("/api/Taxonomy/level1"),
        api.get("/api/Taxonomy/level2"),
        api.get("/api/Lookups/regulatory-frameworks"),
        api.get("/api/Permission"),
      ])

      setTimezones(tz.data.data || [])
      setTiers(tier.data.data || [])
      setL1(l1Res.data.data || [])
      setL2(l2Res.data.data || [])
      setFrameworks(fw.data.data || [])

      const map = new Map<number, string>()
      perm.data.data.forEach((p: any) => {
        map.set(p.id, p.code)
      })
      setPermissionMap(map)
    }

    load()
  }, [])

  /* ===============================
     TIER → PERMISSIONS
  =============================== */
  useEffect(() => {
    if (!form.tierId) return

    const load = async () => {
      const ids = await getTierPermissions(form.tierId)

      const codes = ids
        .map((id: number) => permissionMap.get(id))
        .filter(Boolean)

      setSelectedPermissions(codes)
    }

    load()
  }, [form.tierId, permissionMap])

  /* ===============================
     SYNC PERMISSIONS TO FORM
  =============================== */
  useEffect(() => {
    const payload = selectedPermissions.map(code => ({
      permissionId: [...permissionMap.entries()].find(([_, c]) => c === code)?.[0],
      isAllowed: true,
    }))

    setValue("permissions", payload)
  }, [selectedPermissions])

  /* ===============================
     GROUP L1 + L2
  =============================== */
  const grouped = l1.map(g => ({
    ...g,
    children: l2.filter(x => x.taxonomyLevel1Id === g.id),
  }))

  /* ===============================
     SUBMIT
  =============================== */
  const onSubmit = (data: ClientForm) => {
    console.log("FINAL PAYLOAD", data)
  }

  /* ===============================
     RENDER
  =============================== */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="space-y-6">

          {/* CLIENT DETAILS */}
          <div className="rounded-xl border p-6 space-y-5">
            <h3 className="font-semibold">Client Details</h3>

            <Input {...register("name")} placeholder="Client name" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}

            <div className="flex gap-2">
              {["active", "inactive"].map(s => (
                <Button
                  key={s}
                  type="button"
                  variant={form.status === s ? "default" : "outline"}
                  onClick={() => setValue("status", s as any)}
                >
                  {s}
                </Button>
              ))}
            </div>

            {/* TIMEZONE */}
            <Popover.Root open={openTz} onOpenChange={setOpenTz}>
              <Popover.Trigger asChild>
                <button className="w-full border px-3 py-2 text-sm flex justify-between">
                  {form.timezoneId
                    ? timezones.find(t => t.id === form.timezoneId)?.displayName
                    : "Select time zone"}
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </button>
              </Popover.Trigger>
              <Popover.Content className="w-full border bg-background">
                <Command>
                  <CommandInput />
                  <CommandList>
                    {timezones.map(t => (
                      <CommandItem
                        key={t.id}
                        onSelect={() => {
                          setValue("timezoneId", t.id)
                          setOpenTz(false)
                        }}
                      >
                        {t.displayName}
                        {form.timezoneId === t.id && <Check className="ml-auto h-4 w-4" />}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </Popover.Content>
            </Popover.Root>

            <Input {...register("location")} placeholder="Location" />
            <Input {...register("email")} placeholder="Email" />
            <Input {...register("phone")} placeholder="(555) 123-4567" />
          </div>

          {/* COMPLIANCE */}
          <div className="rounded-xl border p-6 space-y-5">
            <h3 className="font-semibold">Compliance</h3>

            {/* INDUSTRY */}
            <Popover.Root open={openIndustry} onOpenChange={setOpenIndustry}>
              <Popover.Trigger asChild>
                <button className="w-full border px-3 py-2 text-sm flex justify-between">
                  {form.industryId
                    ? l2.find(x => x.id === form.industryId)?.name
                    : "Select industry"}
                  <ChevronsUpDown />
                </button>
              </Popover.Trigger>

              <Popover.Content className="w-full border bg-background">
                <Command>
                  <CommandInput />
                  <CommandList>
                    {grouped.map(g => (
                      <div key={g.id}>
                        <div className="px-2 text-xs text-muted-foreground">{g.name}</div>
                        {g.children.map((c: any) => (
                          <CommandItem
                            key={c.id}
                            onSelect={() => {
                              setValue("industryId", c.id)
                              setOpenIndustry(false)
                            }}
                          >
                            {c.name}
                            {form.industryId === c.id && <Check className="ml-auto h-4 w-4" />}
                          </CommandItem>
                        ))}
                      </div>
                    ))}
                  </CommandList>
                </Command>
              </Popover.Content>
            </Popover.Root>

            {/* FRAMEWORK */}
            <Popover.Root open={openFramework} onOpenChange={setOpenFramework}>
              <Popover.Trigger asChild>
                <button className="w-full border px-3 py-2 text-sm flex justify-between">
                  {form.frameworkIds?.length
                    ? `${form.frameworkIds.length} selected`
                    : "Select frameworks"}
                  <ChevronsUpDown />
                </button>
              </Popover.Trigger>

              <Popover.Content className="w-full border bg-background">
                <Command>
                  <CommandList>
                    {frameworks.map(f => {
                      const active = form.frameworkIds?.includes(f.id)

                      return (
                        <CommandItem
                          key={f.id}
                          onSelect={() => {
                            const next = active
                              ? form.frameworkIds.filter(x => x !== f.id)
                              : [...(form.frameworkIds || []), f.id]

                            setValue("frameworkIds", next)
                          }}
                        >
                          {f.name}
                          {active && <Check className="ml-auto" />}
                        </CommandItem>
                      )
                    })}
                  </CommandList>
                </Command>
              </Popover.Content>
            </Popover.Root>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* SUBSCRIPTION */}
          <div className="rounded-xl border p-6 space-y-4">
            <h3 className="font-semibold">Subscription</h3>

            <div className="flex border rounded-md overflow-hidden">
              {tiers.map(t => (
                <button
                  key={t.id}
                  onClick={() => setValue("tierId", t.id)}
                  className={cn(
                    "flex-1 px-3 py-2",
                    form.tierId === t.id ? "bg-primary text-white" : ""
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <Popover.Root open={openDate} onOpenChange={setOpenDate}>
              <Popover.Trigger asChild>
                <button className="w-full border px-3 py-2 flex justify-between">
                  {form.startDate
                    ? format(new Date(form.startDate), "MM/dd/yyyy")
                    : "Select date"}
                  <CalendarIcon />
                </button>
              </Popover.Trigger>

              <Popover.Content className="p-2 border bg-background">
                <Calendar
                  mode="single"
                  selected={form.startDate ? new Date(form.startDate) : undefined}
                  onSelect={(d) => {
                    if (!d) return
                    setValue("startDate", d.toISOString(), { shouldValidate: true })
                    setOpenDate(false)
                  }}
                />
              </Popover.Content>
            </Popover.Root>
          </div>

          {/* PLATFORM ACCESS */}
          <div className="rounded-xl border p-6 space-y-4">
            <h3 className="font-semibold">Platform Access</h3>

            {permissionConfig.map(section => (
              <div key={section.section}>
                <p className="text-xs text-muted-foreground">{section.section}</p>

                {section.items.map(f => (
                  <div key={f.id} className="flex justify-between py-2">
                    <span>{f.label}</span>

                    <div className="flex gap-2">
                      {f.permissions.map(p => {
                        const active = selectedPermissions.includes(p.code)

                        return (
                          <button
                            key={p.code}
                            onClick={() =>
                              setSelectedPermissions(prev =>
                                prev.includes(p.code)
                                  ? prev.filter(x => x !== p.code)
                                  : [...prev, p.code]
                              )
                            }
                            className={cn(
                              "px-2 py-1 text-xs border rounded-md",
                              active
                                ? "bg-primary text-white"
                                : "hover:bg-muted"
                            )}
                          >
                            {p.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-center gap-4 pt-4 border-t">
        <button className="px-6 py-2 bg-primary text-white rounded-md">
          Save Client
        </button>

        <button
          type="button"
          onClick={() => navigate({ to: "/client-management" })}
          className="px-6 py-2 border rounded-md"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}