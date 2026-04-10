import { useSearch, useNavigate } from "@tanstack/react-router"

export const useDataTableState = () => {
  const search = useSearch({ strict: false })
  const navigate = useNavigate()

  const page = Number(search.page ?? 1)
  const pageSize = Number(search.pageSize ?? 10)
  const sort = search.sort ?? ""
  const searchText = search.search ?? ""

  const setState = (updates: Record<string, any>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...updates,
      }),
    })
  }

  return {
    page,
    pageSize,
    sort,
    searchText,

    setPage: (p: number) => setState({ page: p }),

    setPageSize: (size: number) =>
      setState({
        pageSize: size,
        page: 1,
      }),

    setSort: (s: string) => setState({ sort: s }),

    setSearch: (s: string) =>
      setState({
        search: s,
        page: 1,
      }),

    // ✅ FILTER SUPPORT
    getFilter: (key: string): string[] => {
      const val = search[key]
      if (!val) return []
      return Array.isArray(val) ? val : [val]
    },

    setFilter: (key: string, values: string[]) => {
      setState({
        [key]: values.length ? values : undefined,
        page: 1,
      })
    },

    clearAllFilters: () => {
      const newSearch = { ...search }

      Object.keys(newSearch).forEach((k) => {
        if (!["page", "pageSize", "sort", "search"].includes(k)) {
          delete newSearch[k]
        }
      })

      navigate({ search: newSearch })
    },
  }
}