import Toolbar from '@/components/shared/Toolbar'
import { Route } from 'react-router-dom'
import { home, settings, time, helpCircle } from 'ionicons/icons'
import { IonRouterOutlet, IonTabs } from '@ionic/react'
import SearchItem from '@/pages/user/SearchItem'
import { lazy, Suspense } from 'react'

const Catalog = lazy(() => import('@/pages/user/Catalog'))
const FAQs = lazy(() => import('@/pages/user/FAQs'))
const Settings = lazy(() => import('@/pages/shared/Settings'))
const History = lazy(() => import('@/pages/user/History'))

export default function UserRoutes () {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Suspense fallback={<div />}>
          <div className='h-full bg-white'>
            <div className='md:w-3/4 lg:w-1/3 xl:w-1/3 h-full md:mx-auto lg:mx-auto'>
              <Route path='/user/home' render={() => <Catalog />} />
              <Route path='/user/faqs' render={() => <FAQs />} />
              <Route path='/user/settings' render={() => <Settings />} />
              <Route path='/user/history' render={() => <History />} />
              <Route path='/user/search' render={() => <SearchItem />} />
            </div>
          </div>
        </Suspense>
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
