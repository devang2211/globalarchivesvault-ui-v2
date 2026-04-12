import { useEffect, useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useParams } from "@tanstack/react-router"
import { Check, X, ChevronLeft, ChevronRight, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"

import api from "@/shared/api/client"
import { clientDetailsSchema, type ClientDetailsForm } from "../schema/onboarding.schema"
import { ClientDetailsSection } from "../components/ClientDetailsSection"
import { ComplianceSection } from "../components/ComplianceSection"
import { SubscriptionSection } from "../components/SubscriptionSection"
import { PlatformAccessSection } from "../components/PlatformAccessSection"
import { getClient } from "../api/client.api"

/* ------------------------------------------------------------------ */
/* STEPS CONFIG                                                         */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    id: "client-details",
    title: "Client Details",
    subtitle: "Basic organization information",
    fields: ["name", "contactEmail", "contactPhone"] as (keyof ClientDetailsForm)[],
  },
  {
    id: "compliance",
    title: "Compliance",
    subtitle: "Institution & regulatory frameworks",
    fields: ["taxonomyLevel2Id", "regulatoryFrameworks"] as (keyof ClientDetailsForm)[],
  },
  {
    id: "subscription",
    title: "Subscription",
    subtitle: "Pricing tier & onboard date",
    fields: ["tierId", "startDate"] as (keyof ClientDetailsForm)[],
  },
  {
    id: "platform-access",
    title: "Access Setup",
    subtitle: "Feature permissions for this client",
    fields: [] as (keyof ClientDetailsForm)[],
  },
] as const

type StepId = (typeof STEPS)[number]["id"]

/* ------------------------------------------------------------------ */
/* PAGE                                                                 */
/* ------------------------------------------------------------------ */

export const ClientOnboardingPage = () => {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { id?: string }
  const clientId = params.id ? Number(params.id) : null
  const isEditMode = clientId !== null

  const [activeStep, setActiveStep] = useState<StepId>("client-details")
  const [tiers, setTiers] = useState<{ id: number; name: string }[]>([])
  const [allFrameworks, setAllFrameworks] = useState<{ id: number }[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [clientMap, setClientMap] = useState<Map<string, boolean>>(new Map())
  const [clientVersion, setClientVersion] = useState(0)

  const form = useForm<ClientDetailsForm>({
    resolver: zodResolver(clientDetailsSchema),
    mode: "onTouched",
    defaultValues: {
      id: 0,
      name: "",
      appTimezoneId: null,
      location: "",
      contactEmail: "",
      contactPhone: "",
      isActive: true,
      regulatoryFrameworks: [],
      startDate: "",
    },
  })

  useEffect(() => {
    Promise.all([
      api.get("/api/tier"),
      api.get("/api/Lookups/regulatory-frameworks"),
    ]).then(([tierRes, fwRes]) => {
      setTiers(tierRes.data.data || [])
      setAllFrameworks(fwRes.data.data || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEditMode) return
    const fetchClient = async () => {
      const toastId = toast.loading("Loading client details...")
      try {
        const client = await getClient(clientId!)
        // Seed permission maps before form.reset() triggers tierId watch in PlatformAccessSection
        setClientVersion(client.version ?? 0)
        setClientMap(new Map(client.permissions?.map((p) => [p.permissionCode, p.isAllowed]) ?? []))
        form.reset({
          id: client.id,
          name: client.name,
          appTimezoneId: client.appTimeZoneId ?? null,
          location: client.location ?? "",
          contactEmail: client.contactEmail ?? "",
          contactPhone: client.contactPhone ?? "",
          isActive: client.isActive,
          taxonomyLevel2Id: client.taxonomyLevel2Id as number,
          tierId: client.tierId,
          startDate: client.onBoardingDate ?? "",
          regulatoryFrameworks: (client.regulatoryFrameworks ?? [])
            .filter((f) => f.isAllowed)
            .map(({ regulatoryFrameworkId }) => ({ regulatoryFrameworkId })),
        })
        toast.dismiss(toastId)
      } catch {
        toast.error("Failed to load client details.", { id: toastId })
        navigate({ to: "/client-management" })
      }
    }
    fetchClient()
  }, [clientId])

  const tierId = form.watch("tierId")
  const selectedTierName = tiers.find((t) => t.id === tierId)?.name

  const activeIndex = STEPS.findIndex((s) => s.id === activeStep)
  const activeStepMeta = STEPS[activeIndex]
  const isFirst = activeIndex === 0
  const isLast = activeIndex === STEPS.length - 1

  const goTo = (id: StepId) => {
    const targetIndex = STEPS.findIndex((s) => s.id === id)
    if (targetIndex < activeIndex) setActiveStep(id)
  }

  const goPrev = () => {
    if (!isFirst) setActiveStep(STEPS[activeIndex - 1].id)
  }

  const onSave: SubmitHandler<ClientDetailsForm> = async (data) => {
    const permissions = Array.from(clientMap.entries()).map(([permissionCode, isAllowed]) => ({
      permissionCode,
      isAllowed,
    }))

    const payload = {
      id: data.id === 0 ? null : data.id,
      version: isEditMode ? clientVersion : undefined,
      name: data.name,
      tierId: data.tierId,
      appTimeZoneId: data.appTimezoneId ?? null,
      taxonomyLevel2Id: data.taxonomyLevel2Id,
      location: data.location || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      onBoardingDate: data.startDate,
      isActive: data.isActive,
      regulatoryFrameworks: allFrameworks.map((fw) => ({
        regulatoryFrameworkId: fw.id,
        isSelected: data.regulatoryFrameworks.some((s) => s.regulatoryFrameworkId === fw.id) ? "Y" : "N",
      })),
      permissions,
    }

    setSubmitting(true)
    const toastId = toast.loading(isEditMode ? "Updating client..." : "Saving client...")
    try {
      await api.post("/api/Client/upsert", payload)
      toast.success(isEditMode ? "Client updated successfully" : "Client saved successfully", { id: toastId })
      navigate({ to: "/client-management" })
    } catch {
      toast.error(isEditMode ? "Failed to update client. Please try again." : "Failed to save client. Please try again.", { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  const goNext = async () => {
    if (isLast) return
    const fields = [...STEPS[activeIndex].fields] as (keyof ClientDetailsForm)[]

    if (fields.length === 0) {
      setActiveStep(STEPS[activeIndex + 1].id)
      return
    }

    const results = await Promise.all(fields.map((f) => form.trigger(f as any)))
    const allValid = results.every(Boolean)

    if (allValid) {
      setActiveStep(STEPS[activeIndex + 1].id)
      return
    }

    const firstInvalidIndex = results.findIndex((r) => !r)
    if (firstInvalidIndex !== -1) {
      const firstInvalidField = fields[firstInvalidIndex]
      const el = document.getElementById(`field-${firstInvalidField}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        el.focus()
      } else {
        form.setFocus(firstInvalidField as any)
      }
    }
  }

  /* ---------------------------------------------------------------- */
  /* RENDER                                                             */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-1 self-stretch rounded-full bg-primary/70 shrink-0" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">
            {isEditMode ? "Edit Client" : "Client Onboarding"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? "Update client details and permissions" : "Set up a new client account"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form className="flex gap-8 items-start" onSubmit={(e) => e.preventDefault()}>
          <fieldset disabled={submitting} className="contents">

          {/* LEFT — STEPPER SIDEBAR */}
          <aside className="w-52 shrink-0">
            <nav className="relative">
              {STEPS.map((step, index) => {
                const isActive = step.id === activeStep
                const isCompleted = index < activeIndex
                const isClickable = isCompleted

                return (
                  <div key={step.id} className="relative flex gap-3">

                    {index < STEPS.length - 1 && (
                      <span
                        className={cn(
                          "absolute left-4 top-9 w-px bottom-0 -mb-1 transition-colors",
                          isCompleted ? "bg-primary/40" : "bg-border/60"
                        )}
                      />
                    )}

                    <div
                      onClick={() => isClickable && goTo(step.id)}
                      className={cn(
                        "flex gap-3 pb-7 text-left w-full",
                        isClickable ? "cursor-pointer group" : "cursor-default"
                      )}
                    >
                      <span
                        className={cn(
                          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : isCompleted
                            ? "border-primary/60 bg-primary/10 text-primary group-hover:bg-primary/20"
                            : "border-border bg-background text-muted-foreground"
                        )}
                      >
                        {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                      </span>

                      <div className="pt-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium leading-tight transition-colors",
                            isActive
                              ? "text-foreground"
                              : isCompleted
                              ? "text-foreground/70 group-hover:text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground/50 mt-0.5 leading-tight">
                          {step.subtitle}
                        </p>
                      </div>
                    </div>

                  </div>
                )
              })}
            </nav>
          </aside>

          {/* RIGHT — ACTIVE SECTION */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            <div className={cn("rounded-xl border border-border/40 bg-card shadow-sm transition-opacity", submitting && "opacity-60 pointer-events-none")}>

              <div className="px-6 py-5 border-b border-border/30">
                <h2 className="text-base font-semibold">{activeStepMeta.title}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {activeStepMeta.subtitle}
                </p>
              </div>

              <div className="px-6 py-5">
                {activeStep === "client-details"  && <ClientDetailsSection />}
                {activeStep === "compliance"       && <ComplianceSection />}
                {activeStep === "subscription"     && <SubscriptionSection />}
                {activeStep === "platform-access"  && (
                  <PlatformAccessSection
                    tierName={selectedTierName}
                    clientMap={clientMap}
                    setClientMap={setClientMap}
                  />
                )}
              </div>

            </div>

            <p className="text-xs text-muted-foreground -mt-3">
              Fields marked <span className="text-destructive font-medium">*</span> are required
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/client-management" })}
                className="cursor-pointer"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>

              <div className="flex gap-3">
                {!isFirst && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goPrev}
                    className="cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}

                {!isLast ? (
                  <Button
                    type="button"
                    onClick={goNext}
                    className="cursor-pointer"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={() => form.handleSubmit(onSave as any)()}
                    className="cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Save Client"}
                  </Button>
                )}
              </div>
            </div>

          </div>
          </fieldset>
        </form>
      </Form>

    </div>
  )
}
