import { useMemo, useState } from 'react'
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

export default function Toolbar ({ toolbarItems }: ToolbarProps) {
  const location = useLocation()
  const [loading, setLoading] = useState(false)

  // Lazy chunk preloads for each tab
  const routePreloads = useMemo(
    () => ({
      '/user/home': () => import('@/pages/user/Catalog'),
      '/user/faqs': () => import('@/pages/user/FAQs'),
      '/user/settings': () => import('@/pages/shared/Settings'),
      '/user/history': () => import('@/pages/user/History')
    }),
    []
  )

  const handlePreload = (route: string) => {
    const preload = (routePreloads as Record<string, () => Promise<any>>)[route]
    if (!preload) return
    setLoading(true)

    preload()
      .catch(() => {})
      .finally(() => {
        // Delay helps ensure the tab transition finishes first
        setTimeout(() => setLoading(false), 150)
      })
  }

  return (
    <>
      <IonTabBar slot='bottom' className='app-toolbar'>
        {toolbarItems.map((item, idx) => {
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
              onClick={() => handlePreload(item.route)}
              style={{
                backgroundColor: isActive ? 'white' : 'var(--color-toolbar-bg)'
              }}
            >
              <IonIcon
                icon={item.icon}
                style={{
                  color: isActive
                    ? 'var(--color-amber-400)'
                    : 'var(--color-inactive-button)'
                }}
              />
              <IonLabel
                style={{
                  color: 'var(--color-inactive-button)'
                }}
              >
                {item.text}
              </IonLabel>
            </IonTabButton>
          )
        })}
      </IonTabBar>
      {loading && <IonLoading isOpen message='Loading...' spinner='crescent' />}
    </>
  )
}
