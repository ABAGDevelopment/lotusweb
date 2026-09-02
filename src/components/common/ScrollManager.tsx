import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scroll behaviour for a single-page app.
 *
 * Two problems this solves:
 *  1. A hash arriving with a navigation (/ #range from a vehicle page) is not
 *     scrolled to by React Router at all.
 *  2. The target section often does not exist yet — content streams in from
 *     Sanity after the first paint — so a single querySelector on mount
 *     silently finds nothing. Hence the retry window.
 *
 * It also resets scroll to the top on a plain page change, which the browser
 * does for free on a full page load but not for client-side routing.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }

    let frame = 0
    let attempts = 0
    // ~2s at 60fps: long enough for the first Sanity response, short enough
    // that a genuinely missing anchor gives up quietly.
    const MAX_ATTEMPTS = 120

    const attempt = () => {
      let target: Element | null = null
      try {
        target = document.querySelector(hash)
      } catch {
        // A hash that isn't a valid selector should not throw.
        return
      }
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      if (attempts++ < MAX_ATTEMPTS) frame = requestAnimationFrame(attempt)
    }

    frame = requestAnimationFrame(attempt)
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  return null
}
