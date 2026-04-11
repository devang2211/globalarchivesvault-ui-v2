import { useLogin } from "../hooks/useLogin"
import { LoginForm } from "../components/LoginForm"
import { AuthLayout } from "@/app/layouts/AuthLayout"
import type { LoginFormValues } from "../schema/login.schema"

import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { setAuth } from "@/shared/lib/auth"

export default function SignInPage() {
  const mutation = useLogin()
  const navigate = useNavigate()

  const handleSubmit = async (data: LoginFormValues) => {
    const toastId = toast.loading("Signing in...")

    try {
      const authData = await mutation.mutateAsync(data)
      setAuth(authData)
      toast.success(`Welcome, ${authData.name}!`, { id: toastId })
      navigate({ to: "/dashboard" })
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(error instanceof Error ? error.message : "Unable to connect to server")
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-10 text-center">

        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-10 w-auto"
          />
        </div>

        {/* Card */}
        <div className="bg-background border border-border rounded-lg shadow-sm p-7 space-y-6 text-left">

          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold tracking-tight">
              Sign in
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password below to log into your account
            </p>
          </div>

          {/* Form */}
          <LoginForm
            onSubmit={handleSubmit}
            loading={mutation.isPending}
          />

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            By clicking sign in, you agree to our{" "}
            <a href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Privacy Policy
            </a>
          </p>

        </div>
      </div>
    </AuthLayout>
  )
}
