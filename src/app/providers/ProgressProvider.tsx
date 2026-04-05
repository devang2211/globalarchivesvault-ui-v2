// import { useEffect } from "react"
// import { useRouterState } from "@tanstack/react-router"
// import { startProgress, stopProgress } from "@/lib/progress"

// export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
//   const navigation = useRouterState({
//     select: (state) => state.status,
//   })

//   useEffect(() => {
//     if (navigation === "pending") {
//       startProgress()
//     } else {
//       stopProgress()
//     }
//   }, [navigation])

//   return <>{children}</>
// }

import { useEffect } from "react"
import { useRouter } from "@tanstack/react-router"
import { startProgress, stopProgress } from "@/lib/progress"

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()

  // ✅ ROUTER EVENTS
  useEffect(() => {
    const unsubStart = router.subscribe("onBeforeLoad", () => {
      startProgress()
    })

    const unsubEnd = router.subscribe("onResolved", () => {
      stopProgress()
    })

    return () => {
      unsubStart()
      unsubEnd()
    }
  }, [router])

  // ✅ INITIAL LOAD (THIS FIXES YOUR ISSUE)
  useEffect(() => {
    startProgress()

    const t = setTimeout(() => {
      stopProgress()
    }, 300)

    return () => clearTimeout(t)
  }, [])

  return <>{children}</>
}