import "@fontsource/manrope/400.css"
import "@fontsource/manrope/500.css"
import "@fontsource/manrope/600.css"

import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"

// import "@fontsource/manrope"
// import "@fontsource/inter"

const savedFont = localStorage.getItem("font")

if (savedFont) {
  document.documentElement.classList.add(`font-${savedFont}`)
} else {
  document.documentElement.classList.add("font-inter") // default
}

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { routeTree } from "./routeTree.gen"
import { Toaster } from "sonner"   // ✅ ADD THIS
import { PreferencesProvider } from "@/app/providers/PreferencesProvider"
import { initFont } from "@/lib/font"
import { setFont } from "@/lib/font"

import NProgress from "nprogress"

;(window as any).NProgress = NProgress


import "nprogress/nprogress.css"
import "./index.css"
import "./styles/theme.css"


initFont()
  ; (window as any).setFont = setFont

const router = createRouter({ routeTree })

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
        <RouterProvider router={router} />
        <Toaster richColors position="bottom-right" />
      </PreferencesProvider>
    </QueryClientProvider>
  </StrictMode>
)
