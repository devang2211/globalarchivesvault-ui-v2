// import { createRootRoute, Outlet } from "@tanstack/react-router"


// export const Route = createRootRoute({
//   component: () => <Outlet />,
// })


import { createRootRoute, Outlet } from "@tanstack/react-router"
import { ProgressProvider } from "@/app/providers/ProgressProvider"

function RootLayout() {
  return (
    <ProgressProvider>
      <Outlet />
    </ProgressProvider>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})