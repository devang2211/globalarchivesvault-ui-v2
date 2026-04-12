import { useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Save, X, Lock, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useRole, useUpsertRole } from "../hooks/useRoles"
import { roleSchema, type RoleForm } from "../schema/role.schema"
import { PermissionsMatrix } from "./PermissionsMatrix"
import { TaxonomyMatrix } from "./TaxonomyMatrix"

type Props = {
  roleId: number | null
  onSaved: (newId?: number) => void
  onCancel: () => void
}

const defaultValues: RoleForm = {
  id: null,
  version: 0,
  name: "",
  isActive: true,
  permissions: [],
  taxonomyLevel4s: [],
}

export function RoleDetailPanel({ roleId, onSaved, onCancel }: Props) {
  const isNew = roleId === null
  const { data: role, isLoading: roleLoading, refetch } = useRole(roleId)
  const { mutate: upsert, isPending: saving } = useUpsertRole()

  const form = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
    defaultValues,
  })

  const { register, watch, setValue, handleSubmit, reset, formState: { errors, isDirty } } = form

  /* Populate form when role data loads */
  useEffect(() => {
    if (isNew) {
      reset(defaultValues)
      return
    }
    if (role) {
      reset({
        id: role.id,
        version: role.version,
        name: role.name,
        isActive: role.isActive,
        permissions: role.permissions,
        taxonomyLevel4s: role.taxonomyLevel4s.map(t => ({
          taxonomyLevel4Id: t.taxonomyLevel4Id,
          isAllowed: t.isAllowed,
          canUpload: t.canUpload,
          canSearch: t.canSearch,
        })),
      })
    }
  }, [role, isNew, reset])

  const isReadOnly = !isNew && role?.isHidden === true

  const onSubmit = (values: RoleForm) => {
    upsert(
      {
        id: values.id,
        version: values.version,
        name: values.name,
        isActive: values.isActive,
        permissions: values.permissions,
        taxonomyLevel4s: values.taxonomyLevel4s,
      },
      {
        onSuccess: () => {
          onSaved()
        },
        onError: (err: Error) => {
          if (err.message?.toLowerCase().includes("concurrent")) {
            toast.error(
              "Concurrent modification detected. Please refresh the role and try again.",
              { duration: 6000 }
            )
          }
        },
      }
    )
  }

  if (!isNew && roleLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col h-full"
      >
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Panel header */}
          <div className="flex items-start gap-3">
            <span className="mt-0.5 w-1 self-stretch rounded-full bg-primary/70 shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  {isNew ? "New Role" : role?.name ?? "Role Details"}
                </h2>
                {isReadOnly && (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    System Role
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isReadOnly
                  ? "This is a system role and cannot be modified."
                  : isNew
                  ? "Configure the new role's name and permissions."
                  : "Edit role name and permission assignments."}
              </p>
            </div>
          </div>

          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              {...register("name")}
              disabled={isReadOnly}
              placeholder="e.g. Finance Manager"
              className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* isActive toggle — only shown on edit, not new (backend sets true by default) */}
          {!isNew && (
            <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Active Status</Label>
                <p className="text-xs text-muted-foreground">
                  Inactive roles cannot be assigned to users.
                </p>
              </div>
              <Switch
                checked={watch("isActive")}
                disabled={isReadOnly}
                onCheckedChange={val => setValue("isActive", val)}
                className={cn(!isReadOnly && "cursor-pointer")}
              />
            </div>
          )}

          {/* Permissions Matrix */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Platform Permissions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Control what actions this role can perform.
              </p>
            </div>
            <PermissionsMatrix readonly={isReadOnly} />
          </div>

          {/* Taxonomy Level 4 Matrix */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Taxonomy Access</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Control which taxonomy items this role can view, upload to, and search.
              </p>
            </div>
            <TaxonomyMatrix readonly={isReadOnly} />
          </div>

        </div>

        {/* Sticky footer */}
        {!isReadOnly && (
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
                {saving ? "Saving..." : "Save Role"}
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
        )}

        {/* Read-only footer with refresh for system roles */}
        {isReadOnly && (
          <div className="shrink-0 border-t border-border/60 px-6 py-4 flex justify-end bg-background">
            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              className="cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  )
}
