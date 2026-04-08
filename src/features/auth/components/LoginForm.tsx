import { useState } from "react"
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormValues } from "../schema/login.schema"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = {
    onSubmit: (data: LoginFormValues) => void
    loading: boolean
}

export const LoginForm = ({ onSubmit, loading }: Props) => {
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    return (


        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" autoComplete="off" noValidate>
            <fieldset
                disabled={loading}
                className={`space-y-5 transition-opacity`}
            >
                <div className="space-y-2">
                    <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>Email</Label>
                    <Input id="email" type="email" autoComplete="off" placeholder="name@example.com" aria-invalid={!!errors.email} {...register("email")} />
                    {errors.email && (
                        <p className="text-sm text-destructive">
                            {errors.email.message}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>Password</Label>
                        <a
                            href="#"
                            className="
    text-sm font-medium text-muted-foreground
    hover:text-muted-foreground/80
    transition-colors
    cursor-pointer
  "
                        >
                            Forgot password?
                        </a>
                    </div>

                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            aria-invalid={!!errors.password}
                            autoComplete="new-password"
                            className="pr-10"
                            {...register("password")}
                        />

                        {/* Eye toggle */}
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="
    absolute right-2 top-1/2 -translate-y-1/2
    p-1.5 rounded-md
    text-muted-foreground
    hover:bg-muted hover:text-foreground
    transition-colors
    cursor-pointer
  "
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-sm text-destructive">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {/* Submit */}

                <Button
                    className="w-full h-9 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"

                >
                    <>
                        <LogIn className="h-4 w-4" />
                        {loading ? "Signing in..." : "Sign In"}
                    </>
                </Button>
                {/* <p className="text-[11px] leading-4 text-muted-foreground text-center">
                    By clicking sign in, you agree to our{" "}
                    <a
                        href="#"
                        className="font-medium text-foreground/80 hover:text-foreground transition-colors"
                    >
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                        href="#"
                        className="font-medium text-foreground/80 hover:text-foreground transition-colors"
                    >
                        Privacy Policy
                    </a>.
                </p> */}
            </fieldset>
        </form>

    )
}