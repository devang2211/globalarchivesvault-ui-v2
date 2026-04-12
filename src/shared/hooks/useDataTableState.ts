import { useState, useEffect, useCallback } from "react"

type TableState = {
  page: number
  pageSize: number
  sort: string
  searchText: string
  filters: Record<string, string[]>
}

const DEFAULT_STATE: TableState = {
  page: 1,
  pageSize: 10,
  sort: "",
  searchText: "",
  filters: {},
}

function readStorage(key: string): TableState {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return DEFAULT_STATE
    const saved = JSON.parse(raw)
    return {
      page:       Number(saved.page     ?? 1),
      pageSize:   Number(saved.pageSize ?? 10),
      sort:       saved.sort            ?? "",
      searchText: saved.searchText      ?? "",
      filters:    saved.filters         ?? {},
    }
  } catch {
    return DEFAULT_STATE
  }
}

export const useDataTableState = (storageKey?: string) => {
  const [state, setState] = useState<TableState>(() =>
    storageKey ? readStorage(storageKey) : DEFAULT_STATE
  )

  useEffect(() => {
    if (!storageKey) return
    sessionStorage.setItem(storageKey, JSON.stringify(state))
  }, [state, storageKey])

  const update = useCallback((updates: Partial<TableState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    page:       state.page,
    pageSize:   state.pageSize,
    sort:       state.sort,
    searchText: state.searchText,

    setPage:     (p: number)    => update({ page: p }),
    setPageSize: (size: number) => update({ pageSize: size, page: 1 }),
    setSort:     (s: string)    => update({ sort: s }),
    setSearch:   (s: string)    => update({ searchText: s, page: 1 }),

    getFilter: (key: string): string[] => state.filters[key] ?? [],

    setFilter: (key: string, values: string[]) =>
      update({ filters: { ...state.filters, [key]: values }, page: 1 }),

    clearAllFilters: () => {
      if (storageKey) sessionStorage.removeItem(storageKey)
      setState(prev => ({ ...DEFAULT_STATE, pageSize: prev.pageSize }))
    },
  }
}
