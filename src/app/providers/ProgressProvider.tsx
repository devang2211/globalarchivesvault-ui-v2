import { useEffect } from "react"
import { useRouter } from "@tanstack/react-router"
import { startRouteProgress, stopRouteProgress } from "@/lib/progress"

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()

  // ✅ ROUTER EVENTS
  useEffect(() => {
    const unsubStart = router.subscribe("onBeforeLoad", () => {
      startRouteProgress()
    })

    const unsubEnd = router.subscribe("onResolved", () => {
      stopRouteProgress()
    })

    return () => {
      unsubStart()
      unsubEnd()
    }
  }, [router])

    // ✅ Initial page load (F5 fix)
  useEffect(() => {
    startRouteProgress()

    if (document.readyState === "complete") {
      stopRouteProgress()
    } else {
      const handleLoad = () => stopRouteProgress()
      window.addEventListener("load", handleLoad, { once: true })
      return () => window.removeEventListener("load", handleLoad)
    }
  }, [])

  // ✅ INITIAL LOAD (THIS FIXES YOUR ISSUE)
  // useEffect(() => {
  //   startProgress()

  //   const t = setTimeout(() => {
  //     stopProgress()
  //   }, 300)

  //   return () => clearTimeout(t)
  // }, [])

  return <>{children}</>
}