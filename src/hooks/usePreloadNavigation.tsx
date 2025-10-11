import { useCallback, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Preferences } from '@capacitor/preferences'
import { routePreloads } from '@/configs/routePreloads'

// in-memory cache for runtime (within the same app session)
const moduleCache = new Map<string, Promise<any>>()

// key used in Capacitor Preferences
const PREF_KEY = 'preloadedRoutes'

// helper: mark route as preloaded in Preferences
async function markRoutePreloaded (route: string) {
  const { value } = await Preferences.get({ key: PREF_KEY })
  const stored = value ? JSON.parse(value) : []
  if (!stored.includes(route)) {
    stored.push(route)
    await Preferences.set({
      key: PREF_KEY,
      value: JSON.stringify(stored)
    })
  }
}

// helper: check if route is already marked as preloaded
async function isRoutePreloaded (route: string): Promise<boolean> {
  const { value } = await Preferences.get({ key: PREF_KEY })
  const stored = value ? JSON.parse(value) : []
  return stored.includes(route)
}

export function usePreloadNavigation () {
  const history = useHistory()
  const [loading, setLoading] = useState(false)

  const navigateWithPreload = useCallback(
    async (route: string) => {
      const preload = routePreloads[route]

      // navigate directly if no preload mapping
      if (!preload) {
        history.push(route)
        return
      }

      const alreadyMarked = await isRoutePreloaded(route)
      if (alreadyMarked) {
        history.push(route)
        return
      }

      if (!moduleCache.has(route)) {
        moduleCache.set(route, preload())
      }

      setLoading(true)
      try {
        await moduleCache.get(route)
        await markRoutePreloaded(route)
      } catch {
        // ignore preload errors, still navigate
      } finally {
        history.push(route)
        setTimeout(() => setLoading(false), 150)
      }
    },
    [history]
  )

  return { navigateWithPreload, loading }
}
