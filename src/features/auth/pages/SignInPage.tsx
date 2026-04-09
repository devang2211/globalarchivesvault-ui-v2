import { useEffect, useState } from "react"
import { useLogin } from "../hooks/useLogin"
import { LoginForm } from "../components/LoginForm"
import { AuthLayout } from "@/app/layouts/AuthLayout"

import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { setAuth } from "@/shared/lib/auth"

export default function SignInPage() {
  const mutation = useLogin()
  const navigate = useNavigate()

  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = async (data: any) => {
    const toastId = toast.loading("Signing in...")

    try {
      const res = await mutation.mutateAsync(data)

      if (!res.success) {
        toast.dismiss(toastId)
        toast.error(res.error?.message || "Invalid credentials")
        return
      }

      if (!res?.data) {
        throw new Error("Invalid sign-in response")
      }
      setAuth(res.data)

      toast.dismiss(toastId)

      navigate({ to: "/dashboard" })
    } catch (error: any) {
      toast.dismiss(toastId)
      // Network / server error
      toast.error(
        error.message ||
        "Unable to connect to server"
      )
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
            <span className="underline underline-offset-2 cursor-pointer">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="underline underline-offset-2 cursor-pointer">
              Privacy Policy
            </span>
          </p>

        </div>
      </div>
    </AuthLayout>
  )
}