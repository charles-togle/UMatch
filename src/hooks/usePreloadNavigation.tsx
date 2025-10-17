import { useCallback, useState } from 'react'
import { useIonRouter } from '@ionic/react'
import { routePreloads, moduleCache } from '@/configs/routePreloads'

export function usePreloadNavigation () {
  const router = useIonRouter()
  const [loading, setLoading] = useState(false)

  const navigateWithPreload = useCallback(
    async (route: string) => {
      console.log(moduleCache)
      const preload = routePreloads[route]

      // No configured preload: navigate immediately
      if (!preload) {
        router.push(route, 'none') // no animation
        return
      }

      // Ensure there is a single in-flight preload promise per route
      if (!moduleCache.has(route)) {
        moduleCache.set(route, preload())
      }

      setLoading(true)
      try {
        await moduleCache.get(route)
      } catch {
        // ignore preload errors
      } finally {
        router.push(route, 'none') // no animation
        setTimeout(() => setLoading(false), 150)
      }
    },
    [router]
  )

  return { navigateWithPreload, loading }
}
