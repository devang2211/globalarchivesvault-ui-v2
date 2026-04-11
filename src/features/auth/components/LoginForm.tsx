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

  useEffect(() => {
    if (submitFailed > 0) form.setFocus("password")
  }, [submitFailed])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, () => form.setFocus("password"))} className="grid gap-3" noValidate>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="name@example.com"
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="********"
                  autoComplete="current-password"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {/* TODO: switch to <Link to="/forgot-password"> once that route is created */}
              <a
                href="/forgot-password"
                className="absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75"
              >
                Forgot password?
              </a>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className={cn("mt-2 cursor-pointer", loading && "animate-pulse")}
          disabled={loading}
        >
          <LogIn />
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Form>
  )
}
