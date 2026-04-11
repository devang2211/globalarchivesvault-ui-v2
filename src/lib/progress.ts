// import NProgress from "nprogress"

// let timeout: any
// let startTime = 0
// let requestCount = 0
// let isStarted = false

// NProgress.configure({
//   showSpinner: false,
//   minimum: 0.08,
//   trickleSpeed: 120,
//   easing: "ease",
//   speed: 500,
// })

// export const startProgress = () => {
//   requestCount++

//   if (requestCount === 1) {
//     startTime = Date.now()
//     isStarted = false

//     // 🔥 shorter delay + safe start
//     timeout = setTimeout(() => {
//       NProgress.start()
//       isStarted = true
//     }, 80) // 👈 reduced from 120
//   }
// }

// export const stopProgress = () => {
//   requestCount = Math.max(requestCount - 1, 0)

//   if (requestCount === 0) {
//     clearTimeout(timeout)

//     const finish = () => {
//       NProgress.done()
//       isStarted = false
//     }

//     // 🔥 if never started → don't flash it
//     if (!isStarted) {
//       return
//     }

//     const elapsed = Date.now() - startTime
//     const minDuration = 300 // 👈 reduced from 400
//     const remaining = minDuration - elapsed

//     setTimeout(finish, remaining > 0 ? remaining : 0)
//   }
// }

import NProgress from "nprogress"

let routeCount = 0
let apiCount = 0

let startTime = 0
let isStarted = false
let apiTimeout: ReturnType<typeof setTimeout> | null = null
let stopTimeout: ReturnType<typeof setTimeout> | null = null

NProgress.configure({
  showSpinner: false,
  minimum: 0.08,
  trickleSpeed: 120,
  easing: "ease",
  speed: 500,
})

/* =========================
   ROUTE PROGRESS (instant)
========================= */
export const startRouteProgress = () => {
  routeCount++

  if (stopTimeout !== null) {
    clearTimeout(stopTimeout)
    stopTimeout = null
  }

  if (!isStarted) {
    startTime = Date.now()
    NProgress.start()
    isStarted = true
  }
}

export const stopRouteProgress = () => {
  routeCount = Math.max(routeCount - 1, 0)
  tryStop()
}

/* =========================
   API PROGRESS (delayed)
========================= */
export const startApiProgress = () => {
  apiCount++

  if (stopTimeout !== null) {
    clearTimeout(stopTimeout)
    stopTimeout = null
  }

  if (!isStarted && routeCount === 0 && apiTimeout === null) {
    apiTimeout = setTimeout(() => {
      apiTimeout = null
      if (!isStarted) {
        startTime = Date.now()
        NProgress.start()
        isStarted = true
      }
    }, 80) // prevent flicker
  }
}

export const stopApiProgress = () => {
  apiCount = Math.max(apiCount - 1, 0)
  if (apiCount === 0) { clearTimeout(apiTimeout); apiTimeout = null }
  tryStop()
}

/* =========================
   STOP LOGIC
========================= */
const tryStop = () => {
  if (routeCount === 0 && apiCount === 0 && isStarted) {
    const elapsed = Date.now() - startTime
    const delay = Math.max(0, 300 - elapsed)

    if (stopTimeout !== null) clearTimeout(stopTimeout)
    stopTimeout = setTimeout(() => {
      stopTimeout = null
      NProgress.done()
      isStarted = false
    }, delay)
  }
}