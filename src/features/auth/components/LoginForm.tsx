import { LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormValues } from "../schema/login.schema"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PasswordInput } from "@/components/password-input"

type Props = {
  onSubmit: (data: LoginFormValues) => void
  loading: boolean
  submitFailed: number
}

export const LoginForm = ({ onSubmit, loading, submitFailed }: Props) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  // On auth failure: clear password (security) and refocus
  useEffect(() => {
    if (submitFailed > 0) {
      form.setValue("password", "", { shouldDirty: false, shouldValidate: false })
      form.setFocus("password")
    }
  }, [submitFailed])

  // Browsers inject autofill without firing React's onChange, leaving RHF
  // state stale. Read directly from the DOM on submit to capture autofilled
  // values before RHF validates and calls onSubmit.
  const handleSubmit = (e: { preventDefault(): void; currentTarget: HTMLFormElement }) => {
    e.preventDefault()
    const els = e.currentTarget.elements
    const emailEl = els.namedItem("email") as HTMLInputElement | null
    const passEl = els.namedItem("password") as HTMLInputElement | null

    if (emailEl?.value) form.setValue("email", emailEl.value, { shouldDirty: true })
    if (passEl?.value) form.setValue("password", passEl.value, { shouldDirty: true })

    form.handleSubmit(onSubmit, () => form.setFocus("password"))()
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="name@organization.com"
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {/* TODO: switch to <Link to="/forgot-password"> once that route is created */}
              <a
                href="/forgot-password"
                className="absolute end-0 -top-0.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </a>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className={cn("mt-1 w-full cursor-pointer", loading && "opacity-70 pointer-events-none")}
          disabled={loading}
        >
          <LogIn className="h-4 w-4" />
          {loading ? "Signing in…" : "Sign In"}
        </Button>

      </form>
    </Form>
  )
}
