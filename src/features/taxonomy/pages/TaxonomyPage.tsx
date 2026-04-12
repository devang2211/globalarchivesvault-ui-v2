import { useState } from "react"
import {
  useTaxonomyLevel1s,
  useTaxonomyLevel2s,
  useTaxonomyLevel3s,
  useTaxonomyLevel4s,
  useUpsertTaxonomyLevel1,
  useUpsertTaxonomyLevel2,
  useUpsertTaxonomyLevel3,
  useUpsertTaxonomyLevel4,
} from "../hooks/useTaxonomy"
import { TaxonomyColumn } from "../components/TaxonomyColumn"
import {
  TaxonomyUpsertDialog,
  type DialogDefaultValues,
} from "../components/TaxonomyUpsertDialog"

type DialogState = {
  open: boolean
  level: 1 | 2 | 3 | 4
  defaultValues: DialogDefaultValues
  parentBreadcrumb?: string
}

const CLOSED_DIALOG: DialogState = {
  open: false,
  level: 1,
  defaultValues: { name: "", isActive: true },
}

export default function TaxonomyPage() {
  const [selectedL1, setSelectedL1] = useState<number | null>(null)
  const [selectedL2, setSelectedL2] = useState<number | null>(null)
  const [selectedL3, setSelectedL3] = useState<number | null>(null)
  const [dialog, setDialog] = useState<DialogState>(CLOSED_DIALOG)

  /* Queries */
  const { data: level1s = [], isLoading: loadingL1 } = useTaxonomyLevel1s()
  const { data: level2s = [], isLoading: loadingL2 } = useTaxonomyLevel2s(selectedL1)
  const { data: level3s = [], isLoading: loadingL3 } = useTaxonomyLevel3s(selectedL2)
  const { data: level4s = [], isLoading: loadingL4 } = useTaxonomyLevel4s(selectedL3)

  /* Mutations */
  const { mutate: upsertL1, isPending: savingL1 } = useUpsertTaxonomyLevel1()
  const { mutate: upsertL2, isPending: savingL2 } = useUpsertTaxonomyLevel2()
  const { mutate: upsertL3, isPending: savingL3 } = useUpsertTaxonomyLevel3()
  const { mutate: upsertL4, isPending: savingL4 } = useUpsertTaxonomyLevel4()

  const isSaving = savingL1 || savingL2 || savingL3 || savingL4

  /* Selection handlers — cascade-reset children */
  const handleSelectL1 = (id: number) => {
    setSelectedL1(prev => (prev === id ? null : id))
    setSelectedL2(null)
    setSelectedL3(null)
  }

  const handleSelectL2 = (id: number) => {
    setSelectedL2(prev => (prev === id ? null : id))
    setSelectedL3(null)
  }

  const handleSelectL3 = (id: number) => {
    setSelectedL3(prev => (prev === id ? null : id))
  }

  /* Breadcrumb helpers */
  const l1Name = level1s.find(x => x.id === selectedL1)?.name
  const l2Name = level2s.find(x => x.id === selectedL2)?.name
  const l3Name = level3s.find(x => x.id === selectedL3)?.name

  /* Dialog open helpers */
  const openAddL1 = () =>
    setDialog({ open: true, level: 1, defaultValues: { name: "", isActive: true } })

  const openAddL2 = () =>
    setDialog({
      open: true,
      level: 2,
      defaultValues: { name: "", isActive: true, parentId: selectedL1! },
      parentBreadcrumb: l1Name,
    })

  const openAddL3 = () =>
    setDialog({
      open: true,
      level: 3,
      defaultValues: { name: "", isActive: true, parentId: selectedL2! },
      parentBreadcrumb: l1Name && l2Name ? `${l1Name} › ${l2Name}` : l2Name,
    })

  const openAddL4 = () =>
    setDialog({
      open: true,
      level: 4,
      defaultValues: { name: "", isActive: true, parentId: selectedL3! },
      parentBreadcrumb:
        l1Name && l2Name && l3Name
          ? `${l1Name} › ${l2Name} › ${l3Name}`
          : l3Name,
    })

  const openEditL1 = (item: { id: number; name: string; isActive?: boolean }) =>
    setDialog({
      open: true,
      level: 1,
      defaultValues: { id: item.id, name: item.name, isActive: item.isActive ?? true },
    })

  const openEditL2 = (item: { id: number; name: string; isActive?: boolean }) =>
    setDialog({
      open: true,
      level: 2,
      defaultValues: {
        id: item.id,
        name: item.name,
        isActive: item.isActive ?? true,
        parentId: selectedL1!,
      },
      parentBreadcrumb: l1Name,
    })

  const openEditL3 = (item: { id: number; name: string; isActive?: boolean }) =>
    setDialog({
      open: true,
      level: 3,
      defaultValues: {
        id: item.id,
        name: item.name,
        isActive: item.isActive ?? true,
        parentId: selectedL2!,
      },
      parentBreadcrumb: l1Name && l2Name ? `${l1Name} › ${l2Name}` : l2Name,
    })

  const openEditL4 = (item: { id: number; name: string; isActive?: boolean }) =>
    setDialog({
      open: true,
      level: 4,
      defaultValues: {
        id: item.id,
        name: item.name,
        isActive: item.isActive ?? true,
        parentId: selectedL3!,
      },
      parentBreadcrumb:
        l1Name && l2Name && l3Name
          ? `${l1Name} › ${l2Name} › ${l3Name}`
          : l3Name,
    })

  /* Dialog submit */
  const handleDialogSubmit = (values: DialogDefaultValues) => {
    const onSuccess = () => setDialog(CLOSED_DIALOG)

    if (dialog.level === 1) {
      upsertL1(
        { id: values.id, name: values.name, isActive: values.isActive },
        { onSuccess }
      )
    } else if (dialog.level === 2) {
      upsertL2(
        {
          id: values.id,
          name: values.name,
          isActive: values.isActive,
          taxonomyLevel1Id: values.parentId!,
        },
        { onSuccess }
      )
    } else if (dialog.level === 3) {
      upsertL3(
        {
          id: values.id,
          name: values.name,
          isActive: values.isActive,
          taxonomyLevel2Id: values.parentId!,
        },
        { onSuccess }
      )
    } else {
      upsertL4(
        {
          id: values.id,
          name: values.name,
          isActive: values.isActive,
          taxonomyLevel3Id: values.parentId!,
        },
        { onSuccess }
      )
    }
  }

  return (
    <div className="h-full flex flex-col gap-0">

      {/* Page header */}
      <div className="flex items-start gap-3 mb-6">
        <span className="mt-0.5 w-1 self-stretch rounded-full bg-primary/70 shrink-0" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Taxonomy</h1>
          <p className="text-sm text-muted-foreground">
            Manage the 4-level taxonomy hierarchy used across records and roles.
          </p>
        </div>
      </div>

      {/* 4-column browser */}
      <div className="flex-1 min-h-0 flex rounded-xl border border-border/60 overflow-hidden">

        {/* Level 1 — Industry */}
        <TaxonomyColumn
          title="Industry"
          items={level1s}
          selectedId={selectedL1}
          isLoading={loadingL1}
          isDisabled={false}
          onSelect={handleSelectL1}
          onAdd={openAddL1}
          onEdit={openEditL1}
        />

        {/* Level 2 — Sub-Industry */}
        <TaxonomyColumn
          title="Institution"
          items={level2s}
          selectedId={selectedL2}
          isLoading={!!selectedL1 && loadingL2}
          isDisabled={!selectedL1}
          disabledMessage="Select an Industry first"
          onSelect={handleSelectL2}
          onAdd={openAddL2}
          onEdit={openEditL2}
        />

        {/* Level 3 — Institution Type */}
        <TaxonomyColumn
          title="Department"
          items={level3s}
          selectedId={selectedL3}
          isLoading={!!selectedL2 && loadingL3}
          isDisabled={!selectedL2}
          disabledMessage="Select an Institution first"
          onSelect={handleSelectL3}
          onAdd={openAddL3}
          onEdit={openEditL3}
        />

        {/* Level 4 — Institution Name */}
        <TaxonomyColumn
          title="Record Type"
          items={level4s}
          selectedId={null}
          isLoading={!!selectedL3 && loadingL4}
          isDisabled={!selectedL3}
          disabledMessage="Select a Department first"
          onSelect={() => {}}
          onAdd={openAddL4}
          onEdit={openEditL4}
        />

      </div>

      {/* Upsert dialog */}
      <TaxonomyUpsertDialog
        open={dialog.open}
        onOpenChange={open => !open && setDialog(CLOSED_DIALOG)}
        level={dialog.level}
        parentBreadcrumb={dialog.parentBreadcrumb}
        defaultValues={dialog.defaultValues}
        isPending={isSaving}
        onSubmit={handleDialogSubmit}
      />

    </div>
  )
}
