// import NProgress from "nprogress"

// let requestCount = 0
// let startTime = 0
// let startTimeout: any

// NProgress.configure({
//   showSpinner: false,
//   minimum: 0.15,
//   trickleSpeed: 120,
// })

// export const startProgress = () => {
//   requestCount++

//   if (requestCount === 1) {
//     startTime = Date.now()

//     // 👇 delay start to avoid flicker on fast requests
//     startTimeout = setTimeout(() => {
//       NProgress.start()
//     }, 120)
//   }
// }

// export const stopProgress = () => {
//   requestCount = Math.max(requestCount - 1, 0)

//   if (requestCount === 0) {
//     clearTimeout(startTimeout) // 👈 VERY IMPORTANT

//     const elapsed = Date.now() - startTime
//     const minDuration = 400
//     const remaining = minDuration - elapsed

//     setTimeout(() => {
//       NProgress.done()
//     }, remaining > 0 ? remaining : 0)
//   }
// }

import NProgress from "nprogress"

let timeout: any
let startTime = 0
let requestCount = 0

NProgress.configure({
  showSpinner: false,
  minimum: 0.08,          // slower start (less jumpy)
  trickleSpeed: 120,
  easing: "ease",         // smoother animation
  speed: 500,             // slower = premium feel
})

export const startProgress = () => {
  requestCount++

  if (requestCount === 1) {
    startTime = Date.now()

    timeout = setTimeout(() => {
      NProgress.start()
    }, 120) // prevent flicker
  }
}

export const stopProgress = () => {
  requestCount = Math.max(requestCount - 1, 0)

  if (requestCount === 0) {
    clearTimeout(timeout)

    const elapsed = Date.now() - startTime
    const minDuration = 400
    const remaining = minDuration - elapsed

    setTimeout(() => {
      NProgress.done()
    }, remaining > 0 ? remaining : 0)
  }
}