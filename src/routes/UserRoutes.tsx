import { Suspense } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { IonTabs, IonRouterOutlet } from '@ionic/react'
import Toolbar from '@/components/shared/Toolbar'
import { home, settings, time, helpCircle } from 'ionicons/icons'
import HomeSkeleton from '@/components/user/skeletons/HomeSkeleton'
import Home from '@/pages/user/Home'
import FAQs from '@/pages/user/FAQs'
import Settings from '@/pages/shared/Settings'
import History from '@/pages/user/History'
import NewPost from '@/pages/user/NewPost'
import SearchItem from '@/pages/user/SearchItem'

const HistoryFallback = () => <div className='p-4'>Loading History…</div>
const NewPostFallback = () => <div className='p-4'>Preparing form…</div>
const DefaultFallback = () => <div className='p-4'>Loading…</div>

export default function UserRoutes () {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route
          path='/user/home'
          render={() => (
            <Suspense fallback={<HomeSkeleton />}>
              <Home />
            </Suspense>
          )}
        />
        <Route
          path='/user/history'
          render={() => (
            <Suspense fallback={<HistoryFallback />}>
              <History />
            </Suspense>
          )}
        />
        <Route
          path='/user/new-post'
          render={() => (
            <Suspense fallback={<NewPostFallback />}>
              <NewPost />
            </Suspense>
          )}
        />
        <Route
          path='/user/faqs'
          render={() => (
            <Suspense fallback={<DefaultFallback />}>
              <FAQs />
            </Suspense>
          )}
        />
        <Route
          path='/user/search'
          render={() => (
            <Suspense fallback={<DefaultFallback />}>
              <SearchItem />
            </Suspense>
          )}
        />
        <Route
          path='/user/settings'
          render={() => (
            <Suspense fallback={<DefaultFallback />}>
              <Settings />
            </Suspense>
          )}
        />
        <Route exact path='/user' render={() => <Redirect to='/user/home' />} />
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
