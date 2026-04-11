import "@fontsource/manrope/400.css"
import "@fontsource/manrope/500.css"
import "@fontsource/manrope/600.css"

import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"

// import "@fontsource/manrope"
// import "@fontsource/inter"

// const savedFont = localStorage.getItem("font")

// if (savedFont) {
//   document.documentElement.classList.add(`font-${savedFont}`)
// } else {
//   document.documentElement.classList.add("font-inter") // default
// }

// Apply persisted preferences synchronously before first paint
try {
  const saved = JSON.parse(localStorage.getItem("preferences") || "{}")
  const root = document.documentElement
  if (saved.font) {
    root.classList.remove("font-inter", "font-manrope", "font-system")
    root.classList.add(`font-${saved.font}`)
  }
  if (saved.theme) {
    root.classList.remove("light", "dark")
    if (saved.theme === "system") {
      root.classList.add(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    } else {
      root.classList.add(saved.theme)
    }
  }
} catch {}

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { routeTree } from "./routeTree.gen"
import { Toaster } from "sonner"   // ✅ ADD THIS
import { PreferencesProvider } from "@/app/providers/PreferencesProvider"
import { LayoutProvider } from "@/app/providers/LayoutProvider"
// import { ThemeProvider } from "@/app/providers/ThemeProvider"
// import { initFont } from "@/lib/font"
import { setFont } from "@/lib/font"
import NProgress from "nprogress"
;(window as any).NProgress = NProgress
import "nprogress/nprogress.css"
import "./index.css"
import "./styles/theme.css"
import { getToken } from "./shared/lib/auth"
import { routerRef } from "./shared/api/routerRef"

;(window as any).setFont = setFont

const router = createRouter({
  routeTree,
  context: {
    auth: {
      isAuthenticated: !!getToken(),
    },
  },
})

routerRef.current = router

// router.subscribe("onBeforeLoad", () => {
//   startProgress()
// })

// router.subscribe("onResolved", () => {
//   stopProgress()
// })

const queryClient = new QueryClient()

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>   {/* ✅ ADD HERE */}
{/* <ThemeProvider> */}
  <LayoutProvider>
    <RouterProvider router={router} />
  </LayoutProvider>
{/* </ThemeProvider> */}
        <Toaster richColors position="bottom-right" />
      </PreferencesProvider>
    </QueryClientProvider>
  </StrictMode>
)
