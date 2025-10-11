import { useMemo, useState, useCallback } from 'react'
import {
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonLoading
} from '@ionic/react'
import { useLocation } from 'react-router-dom'

interface ToolbarItem {
  icon: any
  route: string
  text: string
  active?: boolean
}

type ToolbarProps = {
  toolbarItems: ToolbarItem[]
}

const moduleCache = new Map<string, Promise<any>>()

export default function Toolbar ({ toolbarItems }: ToolbarProps) {
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  const routePreloads: Record<string, () => Promise<any>> = useMemo(
    () => ({
      '/user/home': () => import('@/pages/user/Catalog'),
      '/user/faqs': () => import('@/pages/user/FAQs'),
      '/user/settings': () => import('@/pages/shared/Settings'),
      '/user/history': () => import('@/pages/user/History')
    }),
    []
  )

  // ✅ memoized style creators
  const getButtonStyle = useCallback(
    (isActive: boolean) => ({
      backgroundColor: isActive ? 'white' : 'var(--color-toolbar-bg)'
    }),
    []
  )

  const getIconStyle = useCallback(
    (isActive: boolean) => ({
      color: isActive
        ? 'var(--color-amber-400)'
        : 'var(--color-inactive-button)'
    }),
    []
  )

  const labelStyle = useMemo(
    () => ({
      color: 'var(--color-inactive-button)'
    }),
    []
  )

  // ✅ memoized preload handler
  const handlePreload = useCallback(
    async (e: any, route: string) => {
      const path = route
      const isActive =
        location.pathname === path ||
        location.pathname.startsWith(path + '/') ||
        location.pathname.startsWith(path)

      if (isActive) {
        try {
          window.dispatchEvent(
            new CustomEvent('app:scrollToTop', { detail: { route: path } })
          )
        } catch {}
        window.scrollTo({ top: 0, behavior: 'smooth' })
        e?.preventDefault?.()
        return
      }

      const preload = routePreloads[route]
      if (!preload) return

      if (!moduleCache.has(route)) {
        moduleCache.set(route, preload())
      }

      const preloadPromise = moduleCache.get(route)
      if (!preloadPromise) return

      setLoading(true)

      try {
        await preloadPromise
      } catch {
      } finally {
        setTimeout(() => setLoading(false), 150)
      }
    },
    [location.pathname, routePreloads]
  )

  const renderedItems = useMemo(
    () =>
      toolbarItems.map((item, idx) => {
        const path = item.route
        const matched =
          location.pathname === path ||
          location.pathname.startsWith(path + '/') ||
          location.pathname.startsWith(path)
        const isActive = !!item.active || matched

        return (
          <IonTabButton
            key={item.route ?? `tab-${idx}`}
            tab={item.route ?? `tab-${idx}`}
            href={item.route}
            onClick={e => handlePreload(e, item.route)}
            style={getButtonStyle(isActive)}
          >
            <IonIcon icon={item.icon} style={getIconStyle(isActive)} />
            <IonLabel style={labelStyle}>{item.text}</IonLabel>
          </IonTabButton>
        )
      }),
    [
      toolbarItems,
      location.pathname,
      handlePreload,
      getButtonStyle,
      getIconStyle,
      labelStyle
    ]
  )

  return (
    <>
      <IonTabBar slot='bottom' className='app-toolbar'>
        {renderedItems}
      </IonTabBar>
      {loading && <IonLoading isOpen message='Loading...' spinner='crescent' />}
    </>
  )
}
