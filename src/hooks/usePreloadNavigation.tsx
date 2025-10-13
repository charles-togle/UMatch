import { useCallback, useState } from 'react'
import { useIonRouter } from '@ionic/react'
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
  const router = useIonRouter()
  const [loading, setLoading] = useState(false)

  const navigateWithPreload = useCallback(
    async (route: string) => {
      const preload = routePreloads[route]

      if (!preload) {
        router.push(route, 'none', 'replace') // no animation
        return
      }

      const alreadyMarked = await isRoutePreloaded(route)
      if (alreadyMarked) {
        router.push(route, 'none', 'replace')
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
        // ignore preload errors
      } finally {
        router.push(route, 'none', 'replace') // no animation
        setTimeout(() => setLoading(false), 150)
      }
    },
    [router]
  )

  return { navigateWithPreload, loading }
}
