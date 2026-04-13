import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import {
  metadataFieldSchema,
  DATA_TYPES,
  type MetadataFieldForm,
} from "../schema/metadata.schema"
import { useMetadataFieldById } from "../hooks/useMetadata"

const DATA_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  number: "Number",
  date: "Date",
  boolean: "Boolean",
  lookup: "Lookup",
}

type DialogDefaultValues = {
  id: number | null
  name: string
  dataType: string
  isEncrypted: boolean
  isMasked: boolean
  isSearchable: boolean
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues: DialogDefaultValues
  isPending: boolean
  onSubmit: (values: DialogDefaultValues) => void
}

export function MetadataFieldUpsertDialog({
  open,
  onOpenChange,
  defaultValues,
  isPending,
  onSubmit,
}: Props) {
  const isEdit = defaultValues.id !== null

  /* Fetch full DTO when editing — for audit timestamps */
  const { data: fullField, isLoading: loadingField } = useMetadataFieldById(
    open && isEdit ? defaultValues.id : null
  )

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MetadataFieldForm>({
    resolver: zodResolver(metadataFieldSchema),
    defaultValues: {
      id: defaultValues.id,
      name: defaultValues.name,
      dataType: defaultValues.dataType as MetadataFieldForm["dataType"] | undefined,
      isEncrypted: defaultValues.isEncrypted,
      isMasked: defaultValues.isMasked,
      isSearchable: defaultValues.isSearchable,
    },
  })

  /* Reset form whenever dialog opens */
  useEffect(() => {
    if (open) {
      reset({
        id: defaultValues.id,
        name: defaultValues.name,
        dataType: defaultValues.dataType as MetadataFieldForm["dataType"] | undefined,
        isEncrypted: defaultValues.isEncrypted,
        isMasked: defaultValues.isMasked,
        isSearchable: defaultValues.isSearchable,
      })
    }
  }, [open, defaultValues, reset])

  /* Populate encrypted/masked/searchable from full DTO once loaded (edit mode) */
  useEffect(() => {
    if (fullField) {
      setValue("isEncrypted", fullField.isEncrypted)
      setValue("isMasked", fullField.isMasked)
      setValue("isSearchable", fullField.isSearchable)
    }
  }, [fullField, setValue])

  const isEncrypted = watch("isEncrypted")
  const isMasked = watch("isMasked")
  const isSearchable = watch("isSearchable")

  const handleFormSubmit = handleSubmit(values => {
    onSubmit({
      id: values.id,
      name: values.name,
      dataType: values.dataType,
      isEncrypted: values.isEncrypted,
      isMasked: values.isMasked,
      isSearchable: values.isSearchable,
    })
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Metadata Field" : "Add Metadata Field"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4 mt-1">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="mf-name">Name</Label>
            <Input
              id="mf-name"
              placeholder="e.g. Document Classification"
              autoComplete="off"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Data Type */}
          <div className="space-y-1.5">
            <Label htmlFor="mf-datatype">Data Type</Label>
            <Controller
              control={control}
              name="dataType"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="mf-datatype" className="w-full">
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DATA_TYPES.map(dt => (
                      <SelectItem key={dt} value={dt}>
                        {DATA_TYPE_LABELS[dt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.dataType && (
              <p className="text-xs text-destructive">{errors.dataType.message}</p>
            )}
          </div>

          {/* Encrypted toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
            <div>
              <Label htmlFor="mf-encrypted" className="text-sm font-medium cursor-pointer">
                Encrypted
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEncrypted ? "Value is stored encrypted at rest" : "Value is stored as plain text"}
              </p>
            </div>
            <Switch
              id="mf-encrypted"
              checked={isEncrypted}
              onCheckedChange={v => setValue("isEncrypted", v, { shouldDirty: true })}
            />
          </div>

          {/* Masked toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
            <div>
              <Label htmlFor="mf-masked" className="text-sm font-medium cursor-pointer">
                Masked
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isMasked ? "Value is masked in the UI for non-privileged users" : "Value is shown as-is"}
              </p>
            </div>
            <Switch
              id="mf-masked"
              checked={isMasked}
              onCheckedChange={v => setValue("isMasked", v, { shouldDirty: true })}
            />
          </div>

          {/* Searchable toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
            <div>
              <Label htmlFor="mf-searchable" className="text-sm font-medium cursor-pointer">
                Searchable
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isSearchable ? "Field is available in search queries" : "Field is excluded from search"}
              </p>
            </div>
            <Switch
              id="mf-searchable"
              checked={isSearchable}
              onCheckedChange={v => setValue("isSearchable", v, { shouldDirty: true })}
            />
          </div>

          {/* Audit info (edit only) */}
          {isEdit && (
            <div className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 space-y-1">
              {loadingField ? (
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3.5 w-32" />
                </div>
              ) : fullField ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    Created {format(new Date(fullField.createdAt), "PPp")}
                  </p>
                  {fullField.updatedAt && (
                    <p className="text-xs text-muted-foreground">
                      Last updated {format(new Date(fullField.updatedAt), "PPp")}
                    </p>
                  )}
                </>
              ) : null}
            </div>
          )}

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
              {isEdit ? "Save Changes" : "Add Field"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
