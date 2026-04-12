import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { clientDetailsSchema, type ClientDetailsForm } from "../schema/onboarding.schema"
import { ClientDetailsSection } from "../components/ClientDetailsSection"
import { ComplianceSection } from "../components/ComplianceSection"
import { SubscriptionSection } from "../components/SubscriptionSection"
import { PlatformAccessSection } from "../components/PlatformAccessSection"

export const ClientOnboardingPage = () => {
  const form = useForm<ClientDetailsForm>({
    resolver: zodResolver(clientDetailsSchema),
    defaultValues: {
      id: 0,
      name: "",
      appTimezoneId: null,
      location: "",
      contactEmail: "",
      contactPhone: "",
      isActive: true,
      regulatoryFrameworkIds: [],
      startDate: "",
    },
  })

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Client Onboarding</h1>
        <p className="text-sm text-muted-foreground">
          Set up a new client account across all required areas
        </p>
      </div>

      <Form {...form}>
        <form className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Client Details</CardTitle>
                <CardDescription>Basic information about the client organisation</CardDescription>
              </CardHeader>
              <CardContent>
                <ClientDetailsSection />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Compliance</CardTitle>
                <CardDescription>Industry classification and regulatory frameworks</CardDescription>
              </CardHeader>
              <CardContent>
                <ComplianceSection />
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subscription</CardTitle>
                <CardDescription>Pricing tier and contract start date</CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionSection />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Platform Access Setup</CardTitle>
                <CardDescription>Feature permissions granted to this client</CardDescription>
              </CardHeader>
              <CardContent>
                <PlatformAccessSection />
              </CardContent>
            </Card>

          </div>

        </form>
      </Form>

    </div>
  )
}
