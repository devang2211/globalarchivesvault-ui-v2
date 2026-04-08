// export default function DashboardPage() {
//   return (
//     <div className="space-y-6">

import { DashboardCard } from "../components/DashboardCard";

//       {/* Page Header */}
//       <div>
//         <h1 className="text-xl font-semibold tracking-tight">
//           Dashboard
//         </h1>
//         <p className="text-sm text-muted-foreground">
//           Overview of your system activity
//         </p>
//       </div>

//       {/* Cards grid */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

//         <div className="border border-border rounded-lg p-4">
//           <p className="text-sm text-muted-foreground">Users</p>
//           <p className="text-2xl font-semibold">1,234</p>
//         </div>

//         <div className="border border-border rounded-lg p-4">
//           <p className="text-sm text-muted-foreground">Documents</p>
//           <p className="text-2xl font-semibold">8,432</p>
//         </div>

//       </div>

//     </div>
//   )
// }

export default function DashboardPage() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your system activity
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total Users" value="1,245" />
        <DashboardCard title="Active Sessions" value="312" />
        <DashboardCard title="Storage Used" value="72%" />
        <DashboardCard title="Errors" value="3" />
      </div>

      {/* Large section */}
      <div className="grid gap-4 md:grid-cols-2">
        <DashboardCard title="Recent Activity" value="Logs..." />
        <DashboardCard title="System Health" value="Healthy" />
      </div>

    </div>
  )
}