import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, X, Eye, EyeOff } from "lucide-react"
import { isSuperAdmin } from "@/shared/lib/auth"
import { useRoles } from "@/features/role-management/hooks/useRoles"
import { useUser, useUpsertUser } from "../hooks/useUsers"
import { userSchema, type UserForm } from "../schema/user.schema"
import { UserPermissionsMatrix } from "./UserPermissionsMatrix"
import { UserTaxonomyMatrix } from "./UserTaxonomyMatrix"
import type { ClientDto } from "@/features/client-management/api/client.api"

type Props = {
  userId: number | null
  clientId: number | null
  clients: ClientDto[]
  onSaved: (newId?: number) => void
  onCancel: () => void
}

const buildDefaultValues = (clientId: number | null): UserForm => ({
  id: null,
  name: "",
  email: "",
  password: "",
  isActive: true,
  clientId: clientId,
  roles: [],
  permissions: [],
  taxonomyLevel4s: [],
})

export function UserDetailPanel({ userId, clientId, clients, onSaved, onCancel }: Props) {
  const isNew = userId === null
  const [showPassword, setShowPassword] = useState(false)

  const { data: userData, isLoading: userLoading } = useUser(userId)
  const { data: roles = [] } = useRoles()
  const { mutate: upsert, isPending: saving } = useUpsertUser()

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: buildDefaultValues(clientId),
  })

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form

  /* Populate form when user data loads */
  useEffect(() => {
    if (isNew) {
      reset(buildDefaultValues(clientId))
      return
    }
    if (userData) {
      reset({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        password: "",
        isActive: userData.isActive,
        clientId: userData.clientId,
        roles: userData.roles.map(r => ({ roleId: r.roleId })),
        permissions: userData.permissions,
        taxonomyLevel4s: userData.taxonomyLevel4s.map(
          ({ taxonomyLevel4Id, isAllowed, canUpload, canSearch }) => ({
            taxonomyLevel4Id,
            isAllowed,
            canUpload,
            canSearch,
          })
        ),
      })
    }
  }, [userData, isNew, clientId, reset])

  const watchedRoles = watch("roles")
  const isRoleChecked = (roleId: number) => watchedRoles.some(r => r.roleId === roleId)
  const toggleRole = (roleId: number) => {
    if (isRoleChecked(roleId)) {
      setValue("roles", watchedRoles.filter(r => r.roleId !== roleId))
    } else {
      setValue("roles", [...watchedRoles, { roleId }])
    }
  }

  const onSubmit = (values: UserForm) => {
    upsert(
      {
        ...values,
        clientId: values.clientId ?? clientId ?? undefined,
      },
      {
        onSuccess: (data) => {
          onSaved(data.id)
        },
      }
    )
  }

  if (!isNew && userLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
        <Tabs defaultValue="details" className="flex flex-col h-full">

          {/* Header + tab list */}
          <div className="shrink-0 px-6 pt-5 pb-0 border-b border-border/60">
            <div className="flex items-start gap-3 mb-4">
              <span className="mt-0.5 w-1 self-stretch rounded-full bg-primary/70 shrink-0" />
              <div className="space-y-0.5 flex-1">
                <h2 className="text-lg font-semibold">
                  {isNew ? "New User" : userData?.name ?? "User Details"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isNew
                    ? "Fill in the details below to create a new user."
                    : "Edit user details, roles, and access permissions."}
                </p>
              </div>
            </div>

            <TabsList className="-mb-px rounded-none bg-transparent p-0 h-auto gap-0">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-0 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="permissions"
                className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-0 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent"
              >
                Permissions
              </TabsTrigger>
              <TabsTrigger
                value="taxonomy"
                className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-0 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent"
              >
                Taxonomy Access
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Scrollable tab content */}
          <div className="flex-1 overflow-y-auto">

            {/* Details tab */}
            <TabsContent value="details" className="p-6 space-y-6 mt-0 focus-visible:ring-0">

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="user-name">Full Name</Label>
                <Input
                  id="user-name"
                  {...register("name")}
                  placeholder="e.g. Jane Smith"
                  className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="user-email">Email Address</Label>
                <Input
                  id="user-email"
                  type="email"
                  {...register("email")}
                  placeholder="e.g. jane@example.com"
                  className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="user-password">
                  Password{" "}
                  {!isNew && (
                    <span className="text-xs text-muted-foreground font-normal">(optional on edit)</span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="user-password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder={isNew ? "Required" : "Leave blank to keep current password"}
                    className={cn(
                      "pr-10",
                      errors.password && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Client selector — SuperAdmin only */}
              {isSuperAdmin() && (
                <div className="space-y-2">
                  <Label htmlFor="user-client">Client</Label>
                  <Select
                    value={watch("clientId") != null ? String(watch("clientId")) : ""}
                    onValueChange={v => setValue("clientId", Number(v), { shouldDirty: true })}
                    disabled={!isNew}
                  >
                    <SelectTrigger
                      id="user-client"
                      className={cn(!isNew && "opacity-60 cursor-not-allowed")}
                    >
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!isNew && (
                    <p className="text-xs text-muted-foreground">
                      Client cannot be changed after user creation.
                    </p>
                  )}
                </div>
              )}

              {/* Active status */}
              <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium cursor-pointer">Active Status</Label>
                  <p className="text-xs text-muted-foreground">
                    Inactive users cannot sign in to the platform.
                  </p>
                </div>
                <Switch
                  checked={watch("isActive")}
                  onCheckedChange={val => setValue("isActive", val, { shouldDirty: true })}
                  className="cursor-pointer"
                />
              </div>

              {/* Roles */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">Assigned Roles</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select the roles to assign to this user.
                  </p>
                </div>
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No roles available.</p>
                ) : (
                  <div className="rounded-xl border border-border/60 divide-y divide-border/40 overflow-hidden">
                    {roles.map(role => (
                      <label
                        key={role.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors"
                      >
                        <Checkbox
                          checked={isRoleChecked(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                          className="shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground">{role.name}</span>
                        </div>
                        {!role.isActive && (
                          <span className="text-xs text-muted-foreground border border-border/60 rounded-full px-2 py-0.5 shrink-0">
                            Inactive
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </TabsContent>

            {/* Permissions tab */}
            <TabsContent value="permissions" className="p-6 mt-0 focus-visible:ring-0">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">Platform Permissions</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Override platform permission access for this user.
                  </p>
                </div>
                <UserPermissionsMatrix />
              </div>
            </TabsContent>

            {/* Taxonomy access tab */}
            <TabsContent value="taxonomy" className="p-6 mt-0 focus-visible:ring-0">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">Taxonomy Access</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Control which taxonomy items this user can view, upload to, and search.
                  </p>
                </div>
                <UserTaxonomyMatrix />
              </div>
            </TabsContent>

          </div>

          {/* Sticky footer */}
          <div className="shrink-0 border-t border-border/60 px-6 py-4 flex items-center justify-between gap-3 bg-background">
            {isDirty ? (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-xs font-medium text-muted-foreground tracking-wide">
                  Unsaved changes
                </span>
              </div>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={saving}
                className={cn("cursor-pointer", saving && "opacity-70 pointer-events-none")}
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save User"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={saving}
                className="cursor-pointer"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>

        </Tabs>
      </form>
    </FormProvider>
  )
}
