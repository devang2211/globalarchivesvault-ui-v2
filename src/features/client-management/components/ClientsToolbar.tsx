type Props = {
  search: any
  onChange: (v: any) => void
}

export const ClientsToolbar = ({ search, onChange }: Props) => {
  return (
    <div className="flex gap-3 flex-wrap">
      {/* SEARCH */}
      <input
        placeholder="Search client..."
        value={search.search ?? ""}
        onChange={(e) =>
          onChange({ search: e.target.value })
        }
        className="border px-3 py-2 rounded-md text-sm"
      />

      {/* STATUS */}
      <select
        value={search.status ?? ""}
        onChange={(e) =>
          onChange({ status: e.target.value })
        }
        className="border px-3 py-2 rounded-md text-sm"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {/* TYPE */}
      <select
        value={search.type ?? ""}
        onChange={(e) =>
          onChange({ type: e.target.value })
        }
        className="border px-3 py-2 rounded-md text-sm"
      >
        <option value="">All Types</option>
        <option value="enterprise">Enterprise</option>
        <option value="standard">Standard</option>
      </select>
    </div>
  )
}