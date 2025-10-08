import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react'
import { useLocation } from 'react-router-dom'

interface ToolbarItem {
  icon: any
  route: string
  text: string
  active?: boolean
}

type ToolbarProps = {
  toolbarItems: Array<ToolbarItem>
}

export default function Toolbar ({ toolbarItems }: ToolbarProps) {
  const location = useLocation()
  return (
    <IonTabBar slot='bottom' className='app-toolbar'>
      {toolbarItems.map((toolbarItem, idx) => {
        const path = toolbarItem.route
        const matched =
          location.pathname === path ||
          location.pathname.startsWith(path + '/') ||
          location.pathname.startsWith(path)
        const isActive = !!toolbarItem.active || matched

        return (
          <IonTabButton
            key={toolbarItem.route ?? idx}
            tab={toolbarItem.text}
            href={toolbarItem.route}
            style={{
              backgroundColor: isActive ? 'white' : 'var(--color-toolbar-bg)'
            }}
          >
            <IonIcon
              icon={toolbarItem.icon}
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
              {toolbarItem.text}
            </IonLabel>
          </IonTabButton>
        )
      })}
    </IonTabBar>
  )
}
