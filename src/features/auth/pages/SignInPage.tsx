import { useEffect, useState } from "react"
import { AuthLayout } from "../../../app/layouts/AuthLayout"
import { LoginForm } from "../components/LoginForm"
import { useLogin } from "../hooks/useLogin"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"


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

      if (!res.isValid) {
        toast.dismiss(toastId)
        toast.error(res.authMessage || "Invalid credentials")
        return
      }

      localStorage.setItem("token", res.accessToken)
      localStorage.setItem("userEmail", data.email)

      toast.dismiss(toastId)

      navigate({ to: "/dashboard" })
    } catch (error: any) {
      toast.dismiss(toastId)

      // ❌ Network / server error
      toast.error(
        error?.response?.data?.message ||
        "Unable to connect to server"
      )
    }
  }

  return (
    <AuthLayout>
      {/* ✅ THIS is where wrapper goes */}
      {/* <div className="mx-auto w-full max-w-sm space-y-6">



        <LoginForm
          onSubmit={handleSubmit}
          loading={mutation.isPending}
        />

      </div> */}

      <div className="space-y-6 text-center">

        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">

          <img src="/logo.svg" className="h-9 w-auto object-contain" />



        </div>

        {/* Card */}
        {/* <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"> */}
        <div className="auth-enter">
          <div
            className={`bg-background/95 backdrop-blur rounded-xl border border-border/50 shadow-md p-7 space-y-5 text-left min-h-[360px] ${mutation.isPending ? "pointer-events-none" : ""
              }`}
          >

            <div className="space-y-1">
              <h1 className="text-lg font-semibold">Sign in</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and password below to log into your account
              </p>
            </div>

            {/* Form */}
            <LoginForm
              onSubmit={handleSubmit}
              loading={mutation.isPending}
            />

          </div>
        </div>
      </div>
    </AuthLayout>
  )
}