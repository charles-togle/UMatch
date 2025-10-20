import { useEffect, useMemo, useRef, useState } from 'react'
import { routePreloads } from '@/configs/routePreloads'
import { Preferences } from '@capacitor/preferences'
import { useNavigation } from '@/hooks/useNavigation'

type Props = {
  authCheck?: () => Promise<boolean>
  concurrency?: number
  timeoutMs?: number
  authedRoute?: string
  unauthedRoute?: string
}

async function defaultAuthCheck (): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key: 'authToken' })
    return Boolean(value)
  } catch {
    return false
  }
}

export default function StartupLoading ({
  authCheck = defaultAuthCheck,
  concurrency = 3,
  timeoutMs = 8000,
  authedRoute = '/user/home',
  unauthedRoute = '/auth'
}: Props) {
  const [done, setDone] = useState(0)
  const routes = useMemo(() => Object.keys(routePreloads), [])
  const total = routes.length
  const cancelled = useRef(false)
  const { navigate } = useNavigation()

  useEffect(() => {
    cancelled.current = false

    const preloadAll = async () => {
      if (!routes.length) return
      let i = 0
      let completed = 0

      const worker = async () => {
        while (!cancelled.current && i < routes.length) {
          const idx = i++
          const route = routes[idx]

          try {
            await routePreloads[route]()
          } catch {
            // ignore errors
          } finally {
            completed++
            setDone(completed)
          }
        }
      }

      const workers = new Array(Math.min(concurrency, routes.length))
        .fill(0)
        .map(() => worker())
      const guard = new Promise((_, rej) =>
        setTimeout(() => rej(new Error('preload-timeout')), timeoutMs)
      )

      try {
        await Promise.race([Promise.allSettled(workers), guard])
      } catch {
        // timed out — carry on
      }
    }

    ;(async () => {
      await new Promise(r => setTimeout(r, 120))
      await preloadAll()

      let loggedIn = false
      try {
        loggedIn = await authCheck()
      } catch {}
      if (cancelled.current) return
      navigate(loggedIn ? authedRoute : unauthedRoute, 'preload')
    })()

    return () => {
      cancelled.current = true
    }
  }, [
    authCheck,
    concurrency,
    timeoutMs,
    routes,
    authedRoute,
    unauthedRoute,
    navigate
  ])

  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className='h-screen w-screen bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 flex items-center justify-center px-6'>
      <div className='max-w-sm w-full text-center'>
        <div
          className='mx-auto h-10 w-10 mb-4 rounded-full border-4 border-neutral-300 dark:border-neutral-700 border-t-transparent animate-spin'
          aria-hidden
        />
        <h1 className='text-lg font-semibold'>Preparing your app…</h1>
        <p className='text-sm text-neutral-500 dark:text-neutral-400 mt-1'>
          {total > 0 ? `${done}/${total} modules (${pct}%)` : 'Starting…'}
        </p>
        <div className='mt-4'>
          <div
            className='h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden'
            role='progressbar'
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
          >
            <div
              className='h-full bg-neutral-900 dark:bg-neutral-100 transition-all duration-300'
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <p className='mt-3 text-xs text-neutral-400'>
          Just cooking some stuff for you…
        </p>
      </div>
    </div>
  )
}
