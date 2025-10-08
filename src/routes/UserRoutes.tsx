import Catalog from '@/pages/user/Catalog'
import Toolbar from '@/components/shared/Toolbar'
import FAQs from '@/pages/user/FAQs'
import Settings from '@/pages/shared/Settings'
import History from '@/pages/user/History'

import { Route } from 'react-router-dom'
import { home, settings, time, helpCircle } from 'ionicons/icons'
import { IonRouterOutlet, IonTabs } from '@ionic/react'

export default function UserRoutes () {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path='/user/home' render={() => <Catalog />} />
        <Route path='/user/faqs' render={() => <FAQs />} />
        <Route path='/user/settings' render={() => <Settings />} />
        <Route path='/user/history' render={() => <History />} />
      </IonRouterOutlet>
      <Toolbar
        toolbarItems={[
          {
            icon: home,
            route: '/user/home',
            text: 'Home'
          },
          {
            icon: time,
            route: '/user/history',
            text: 'History'
          },
          {
            icon: helpCircle,
            route: '/user/faqs',
            text: 'FAQs'
          },
          {
            icon: settings,
            route: '/user/settings',
            text: 'Settings'
          }
        ]}
      />
    </IonTabs>
  )
}
