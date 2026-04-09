import { useEffect, useRef } from "react"

export const useEffectOnce = (effect: () => void) => {
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true
    effect()
  }, [])
}