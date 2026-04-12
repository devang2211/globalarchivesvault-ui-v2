import { useLayoutEffect, useRef } from "react"
import { useClientContextRaw, type ClientContextRegistration } from "@/app/providers/ClientContextProvider"
import type { ClientDto } from "@/features/client-management/api/client.api"

type UseClientContextReturn = {
  selectedClient: ClientDto | null
  clients: ClientDto[]
  isLoading: boolean
}

/**
 * Page-level hook. Register visibility, disabled state and a change callback.
 *
 * Usage:
 *   const { selectedClient } = useClientContext({
 *     visible: true,
 *     disabled: false,
 *     onClientChange: (client) => client && loadData(client.id),
 *   })
 */
export function useClientContext(
  options?: ClientContextRegistration
): UseClientContextReturn {
  const { selectedClient, clients, isLoading, _register, _unregister } = useClientContextRaw()

  // Keep a stable ref to the latest callback so registration effect doesn't
  // re-fire every render when an inline function is passed.
  const callbackRef = useRef(options?.onClientChange)
  callbackRef.current = options?.onClientChange

  const visible = options?.visible
  const disabled = options?.disabled

  useLayoutEffect(() => {
    _register({
      visible,
      disabled,
      onClientChange: (client) => callbackRef.current?.(client),
    })
    return () => _unregister()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, disabled])

  return { selectedClient, clients, isLoading }
}
