import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  level1Schema,
  level2Schema,
  level3Schema,
  level4Schema,
  type Level1Form,
  type Level2Form,
  type Level3Form,
  type Level4Form,
} from "../schema/taxonomy.schema"

const LEVEL_LABELS = {
  1: "Industry",
  2: "Sub-Industry",
  3: "Institution Type",
  4: "Institution Name",
} as const

const schemaByLevel = {
  1: level1Schema,
  2: level2Schema,
  3: level3Schema,
  4: level4Schema,
}

export type DialogDefaultValues = {
  id?: number | null
  name: string
  isActive: boolean
  parentId?: number
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  level: 1 | 2 | 3 | 4
  parentBreadcrumb?: string
  defaultValues: DialogDefaultValues
  isPending: boolean
  onSubmit: (values: DialogDefaultValues) => void
}

export function TaxonomyUpsertDialog({
  open,
  onOpenChange,
  level,
  parentBreadcrumb,
  defaultValues,
  isPending,
  onSubmit,
}: Props) {
  const isEdit = !!defaultValues.id

  const schema = schemaByLevel[level]

  const form = useForm<Level1Form | Level2Form | Level3Form | Level4Form>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues: {
      id: defaultValues.id ?? null,
      name: defaultValues.name,
      isActive: defaultValues.isActive,
      ...(level === 2 ? { taxonomyLevel1Id: defaultValues.parentId } : {}),
      ...(level === 3 ? { taxonomyLevel2Id: defaultValues.parentId } : {}),
      ...(level === 4 ? { taxonomyLevel3Id: defaultValues.parentId } : {}),
    },
  })

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  const isActive = watch("isActive")

  /* Reset form whenever dialog opens with new defaults */
  useEffect(() => {
    if (open) {
      reset({
        id: defaultValues.id ?? null,
        name: defaultValues.name,
        isActive: defaultValues.isActive,
        ...(level === 2 ? { taxonomyLevel1Id: defaultValues.parentId } : {}),
        ...(level === 3 ? { taxonomyLevel2Id: defaultValues.parentId } : {}),
        ...(level === 4 ? { taxonomyLevel3Id: defaultValues.parentId } : {}),
      })
    }
  }, [open, defaultValues, level, reset])

  const handleFormSubmit = handleSubmit(values => {
    onSubmit({
      id: values.id,
      name: values.name,
      isActive: values.isActive,
      parentId: defaultValues.parentId,
    })
  })

  const title = isEdit
    ? `Edit ${LEVEL_LABELS[level]}`
    : `Add ${LEVEL_LABELS[level]}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {parentBreadcrumb && (
            <p className="text-xs text-muted-foreground mt-0.5">{parentBreadcrumb}</p>
          )}
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4 mt-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="tax-name">Name</Label>
            <Input
              id="tax-name"
              placeholder={`Enter ${LEVEL_LABELS[level].toLowerCase()} name`}
              autoComplete="off"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message as string}</p>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
            <div>
              <Label htmlFor="tax-active" className="text-sm font-medium cursor-pointer">
                Active
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isActive ? "Visible and available for use" : "Hidden from selection lists"}
              </p>
            </div>
            <Switch
              id="tax-active"
              checked={isActive}
              onCheckedChange={v => setValue("isActive", v, { shouldDirty: true })}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {isEdit ? "Save Changes" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
