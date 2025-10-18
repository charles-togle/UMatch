import { useCallback, useState } from 'react'
import { useIonRouter } from '@ionic/react'
import { routePreloads, moduleCache } from '@/configs/routePreloads'

export function usePreloadNavigation () {
  const router = useIonRouter()
  const [loading, setLoading] = useState(false)

  const navigateWithPreload = useCallback(
    async (route: string) => {
      const preload = routePreloads[route]
      if (!preload) {
        router.push(route, 'none')
        return
      }
      if (!moduleCache.has(route)) {
        moduleCache.set(route, preload())
      }
      setLoading(true)
      try {
        await moduleCache.get(route)
      } catch {
        setLoading(false)
      } finally {
        router.push(route, 'none')
        setLoading(false)
      }
    },
    [router]
  )

  return { navigateWithPreload, loading }
}
