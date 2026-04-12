import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useQuery } from "@tanstack/react-query"

import { getAuth } from "@/shared/lib/auth"
import { getClients, getClient, type ClientDto } from "@/features/client-management/api/client.api"

/* ─────────────────────────────────────────
   Constants & helpers
───────────────────────────────────────── */
const SESSION_KEY = "active-client-id"

type ActiveClientStorage = { id: number; name: string; isActive: boolean }

function readStorage(): ActiveClientStorage | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as ActiveClientStorage) : null
  } catch { return null }
}

function writeStorage(c: ActiveClientStorage) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(c)) } catch {}
}

function clearStorage() {
  try { sessionStorage.removeItem(SESSION_KEY) } catch {}
}

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
export type ClientContextRegistration = {
  visible?: boolean
  disabled?: boolean
  onClientChange?: (client: ClientDto | null) => void
}

type ClientContextValue = {
  selectedClient: ClientDto | null
  clients: ClientDto[]
  isLoading: boolean
  selectorVisible: boolean
  selectorDisabled: boolean
  selectClient: (client: ClientDto | null) => void
  _register: (reg: ClientContextRegistration) => void
  _unregister: () => void
}

/* ─────────────────────────────────────────
   Context
───────────────────────────────────────── */
const ClientContext = createContext<ClientContextValue | null>(null)

export const useClientContextRaw = () => {
  const ctx = useContext(ClientContext)
  if (!ctx) throw new Error("useClientContextRaw must be used within ClientContextProvider")
  return ctx
}

/* ─────────────────────────────────────────
   Provider
───────────────────────────────────────── */
export const ClientContextProvider = ({ children }: { children: ReactNode }) => {
  const auth = getAuth()
  const isLocked = auth?.userType === "ClientAdmin" || auth?.userType === "ClientUser"

  // Initialise selectedClient from sessionStorage immediately so pill renders without flicker
  const [selectedClient, setSelectedClient] = useState<ClientDto | null>(() => {
    if (isLocked) return null // will be set after locked-client fetch
    const stored = readStorage()
    return stored ? ({ id: stored.id, name: stored.name, isActive: stored.isActive } as ClientDto) : null
  })

  const [selectorVisible, setSelectorVisible] = useState(false)
  const [selectorDisabled, setSelectorDisabled] = useState(false)

  const regRef = useRef<ClientContextRegistration | null>(null)
  const restoreFiredRef = useRef(false)
  const dataRef = useRef<ClientDto[] | undefined>(undefined)

  /* ── Fetch full client list (SuperAdmin only) ── */
  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ["client-context-list"],
    queryFn: () => getClients({ page: 1, pageSize: 500 }),
    enabled: !isLocked,
    staleTime: 5 * 60 * 1000,
  })

  const clients = listData?.items ?? []

  // Keep dataRef in sync for use inside _register (race guard)
  useEffect(() => {
    if (listData) dataRef.current = listData.items
  }, [listData])

  /* ── Fetch locked client (ClientAdmin / ClientUser) ── */
  useEffect(() => {
    if (!isLocked || !auth?.clientId) return
    getClient(auth.clientId)
      .then((detail) => {
        const asDto: ClientDto = { id: detail.id, name: detail.name, isActive: detail.isActive }
        setSelectedClient(asDto)
        // Fire callback once locked client is resolved
        regRef.current?.onClientChange?.(asDto)
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Restore-and-trigger after list query resolves ── */
  useEffect(() => {
    if (!listData || restoreFiredRef.current) return
    const stored = readStorage()
    if (!stored) return

    const fullClient = listData.items.find((c) => c.id === stored.id) ?? null

    if (!fullClient) {
      // Stored client no longer exists in API
      clearStorage()
      setSelectedClient(null)
      regRef.current?.onClientChange?.(null)
    } else {
      setSelectedClient(fullClient)
      regRef.current?.onClientChange?.(fullClient)
    }
    restoreFiredRef.current = true
  }, [listData])

  /* ── Auto-select when only one client and nothing selected ── */
  useEffect(() => {
    if (isLocked || selectedClient || !listData || listData.items.length !== 1) return
    const only = listData.items[0]
    setSelectedClient(only)
    writeStorage({ id: only.id, name: only.name, isActive: only.isActive })
    regRef.current?.onClientChange?.(only)
    restoreFiredRef.current = true
  }, [listData, isLocked, selectedClient])

  /* ── Clean up on unmount (sign-out) ── */
  useEffect(() => {
    return () => { clearStorage() }
  }, [])

  /* ─────────────────────────────────────────
     Actions
  ───────────────────────────────────────── */
  const selectClient = useCallback((client: ClientDto | null) => {
    setSelectedClient(client)
    if (client) writeStorage({ id: client.id, name: client.name, isActive: client.isActive })
    else clearStorage()
    regRef.current?.onClientChange?.(client)
  }, [])

  const _register = useCallback((reg: ClientContextRegistration) => {
    regRef.current = reg
    if (!isLocked) {
      setSelectorVisible(reg.visible ?? true)
    }
    setSelectorDisabled(reg.disabled ?? false)

    // Race guard: if list query already resolved and restore hasn't fired
    if (!isLocked && !restoreFiredRef.current && dataRef.current) {
      const stored = readStorage()
      if (stored) {
        const fullClient = dataRef.current.find((c) => c.id === stored.id) ?? null
        if (!fullClient) {
          clearStorage()
          setSelectedClient(null)
          reg.onClientChange?.(null)
        } else {
          setSelectedClient(fullClient)
          reg.onClientChange?.(fullClient)
        }
        restoreFiredRef.current = true
      }
    }
  }, [isLocked])

  const _unregister = useCallback(() => {
    regRef.current = null
    setSelectorVisible(false)
    setSelectorDisabled(false)
  }, [])

  return (
    <ClientContext.Provider
      value={{
        selectedClient,
        clients,
        isLoading: listLoading,
        selectorVisible,
        selectorDisabled,
        selectClient,
        _register,
        _unregister,
      }}
    >
      {children}
    </ClientContext.Provider>
  )
}
