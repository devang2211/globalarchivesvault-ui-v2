import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { ArrowLeft, CheckCircle2, CircleOff } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Form } from "@/components/ui/form"
import api from "@/shared/api/client"
import { getAuth, isClientAdmin } from "@/shared/lib/auth"
import { unwrap } from "@/shared/api/unwrap"
import type { ApiResponse } from "@/shared/types/api"

import { getClient } from "../api/client.api"
import type { ClientDetailDto } from "../api/client.api"
import { clientDetailsSchema } from "../schema/onboarding.schema"
import { PlatformAccessSection } from "../components/PlatformAccessSection"

type TierItem = { id: number; name: string }
type FrameworkItem = { id: number; name: string }
type TimezoneItem = { id: number; displayName: string }
type IndustryItem = { id: number; name: string; children: { id: number; name: string }[] }

export const ClientDetailsPage = () => {
  const navigate = useNavigate()

  const auth = getAuth()
  const clientId = isClientAdmin()
    ? (auth?.clientId ?? 0)
    : Number(sessionStorage.getItem("view-client-id") || "0")

  const [client, setClient] = useState<ClientDetailDto | null>(null)
  const [tiers, setTiers] = useState<TierItem[]>([])
  const [frameworks, setFrameworks] = useState<FrameworkItem[]>([])
  const [timezones, setTimezones] = useState<TimezoneItem[]>([])
  const [industries, setIndustries] = useState<IndustryItem[]>([])
  const [clientMap, setClientMap] = useState<Map<string, boolean>>(new Map())
  const [notFound, setNotFound] = useState(false)

  const form = useForm({
    resolver: zodResolver(clientDetailsSchema),
    defaultValues: {
      id: 0,
      name: "",
      tierId: 0,
      isActive: false,
      taxonomyLevel2Id: null as unknown as number,
      regulatoryFrameworks: [],
      startDate: "",
    },
  })

  useEffect(() => {
    if (!clientId) {
      setNotFound(true)
      return
    }

    const toastId = toast.loading("Loading client details…")

    Promise.all([
      getClient(clientId),
      api.get<ApiResponse<TierItem[]>>("/api/tier"),
      api.get<ApiResponse<FrameworkItem[]>>("/api/Lookups/regulatory-frameworks"),
      api.get<ApiResponse<TimezoneItem[]>>("/api/Lookups/app-timezones"),
      api.get<ApiResponse<IndustryItem[]>>("/api/taxonomy/industries-with-institutions"),
    ])
      .then(([clientData, tiersRes, frameworksRes, timezonesRes, industriesRes]) => {
        setClient(clientData)
        setTiers(unwrap(tiersRes) ?? [])
        setFrameworks(unwrap(frameworksRes) ?? [])
        setTimezones(unwrap(timezonesRes) ?? [])
        setIndustries(unwrap(industriesRes) ?? [])

        // Seed clientMap from permissions
        const map = new Map<string, boolean>()
        clientData.permissions?.forEach(({ permissionCode, isAllowed }) => {
          map.set(permissionCode, isAllowed)
        })
        setClientMap(map)

        // Set tierId in form so PlatformAccessSection can watch it
        form.reset({
          id: clientData.id,
          name: clientData.name,
          tierId: clientData.tierId,
          isActive: clientData.isActive,
          taxonomyLevel2Id: clientData.taxonomyLevel2Id ?? (null as unknown as number),
          regulatoryFrameworks: clientData.regulatoryFrameworks?.map((f) => ({
            regulatoryFrameworkId: f.regulatoryFrameworkId,
          })) ?? [],
          startDate: clientData.onBoardingDate ?? "",
        })
      })
      .catch(() => {
        setNotFound(true)
      })
      .finally(() => {
        toast.dismiss(toastId)
      })
  }, [clientId])

  const back = () => navigate({ to: "/client-management" })

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted-foreground">Client not found.</p>
        <button
          onClick={back}
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to client management
        </button>
      </div>
    )
  }

  if (!client) return null

  const tierName = tiers.find((t) => t.id === client.tierId)?.name

  // Resolve industry / institution label
  let industryLabel = "—"
  if (client.taxonomyLevel2Id) {
    for (const industry of industries) {
      const child = industry.children.find((c) => c.id === client.taxonomyLevel2Id)
      if (child) {
        industryLabel = `${industry.name} / ${child.name}`
        break
      }
    }
  }

  // Resolve timezone display name
  const timezoneName = timezones.find((tz) => tz.id === client.appTimeZoneId)?.displayName

  // Resolve allowed regulatory frameworks
  const allowedFrameworks = (client.regulatoryFrameworks ?? [])
    .filter((f) => f.isAllowed)
    .map((f) => frameworks.find((fw) => fw.id === f.regulatoryFrameworkId)?.name)
    .filter(Boolean) as string[]

  const onboardDate = client.onBoardingDate
    ? (() => {
        try {
          return format(new Date(client.onBoardingDate), "MMM d, yyyy")
        } catch {
          return client.onBoardingDate
        }
      })()
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={back}
          className="mt-0.5 inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-start justify-between flex-1">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold">{client.name}</h1>
              <Badge
                variant="outline"
                className={cn(
                  "inline-flex items-center gap-1",
                  client.isActive
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}
              >
                {client.isActive ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <CircleOff className="h-3 w-3" />
                )}
                {client.isActive ? "Active" : "Inactive"}
              </Badge>
              {tierName && (
                <Badge variant="secondary">{tierName}</Badge>
              )}
            </div>
            {/* <p className="text-sm text-muted-foreground mt-0.5">Client details</p> */}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-6">
        {/* Organization */}
        <div className="rounded-xl border border-border/40 bg-card shadow-sm">
          <div className="px-6 py-4 border-b border-border/30">
            <h2 className="text-sm font-semibold">Organization</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Contact Email</p>
              <p className="text-sm">
                {client.contactEmail || <span className="text-muted-foreground/40">—</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Contact Phone</p>
              <p className="text-sm">
                {client.contactPhone || <span className="text-muted-foreground/40">—</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Location</p>
              <p className="text-sm">
                {client.location || <span className="text-muted-foreground/40">—</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Time Zone</p>
              <p className="text-sm">
                {timezoneName || <span className="text-muted-foreground/40">—</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Onboard Date</p>
              <p className="text-sm">
                {onboardDate || <span className="text-muted-foreground/40">—</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Compliance */}
        <div className="rounded-xl border border-border/40 bg-card shadow-sm">
          <div className="px-6 py-4 border-b border-border/30">
            <h2 className="text-sm font-semibold">Compliance</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Industry / Institution</p>
              <p className="text-sm">{industryLabel}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Regulatory Frameworks</p>
              {allowedFrameworks.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {allowedFrameworks.map((name) => (
                    <Badge key={name} variant="secondary" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground/40">—</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Platform Access */}
      <div className="rounded-xl border border-border/40 bg-card shadow-sm">
        <div className="px-6 py-4 border-b border-border/30">
          <h2 className="text-sm font-semibold">Platform Access</h2>
          {/* {tierName && (
            <p className="text-sm text-muted-foreground mt-0.5">{tierName}</p>
          )} */}
        </div>
        <div className="px-6 py-5">
          <Form {...form}>
            <PlatformAccessSection
              tierName={tierName}
              clientMap={clientMap}
              readonly
            />
          </Form>
        </div>
      </div>
    </div>
  )
}
