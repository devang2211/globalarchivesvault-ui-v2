// export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
//     return (

//         <div className="relative min-h-screen flex items-center justify-center">

//             {/* Background */}
//             <div className="absolute inset-0">
//                 <img
//                     src="https://globalarchives.net/wp-content/uploads/2025/12/bg-page-scaled.webp"
//                     className="h-full w-full object-cover"
//                 />

//                 {/* Overlay controls visibility */}
//                 <div className="absolute inset-0 bg-white/95" />
//             </div>

//             {/* Content */}
//             <div className="relative z-10 w-full max-w-md px-6">
//                 {children}
//             </div>

//         </div>
//     )
// }

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center">

      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://globalarchives.net/wp-content/uploads/2025/12/bg-page-scaled.webp"
          className="h-full w-full object-cover"
        />

        {/* ✅ MUCH lighter overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] transition-opacity duration-700 opacity-100" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {children}
      </div>

    </div>
  )
}