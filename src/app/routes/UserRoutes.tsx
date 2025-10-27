import { Suspense } from 'react'
import { Route, Redirect } from 'react-router-dom'
import { IonTabs, IonRouterOutlet } from '@ionic/react'
import Toolbar from '@/shared/components/Toolbar'
import { home, settings, time, helpCircle } from 'ionicons/icons'
import HomeSkeleton from '@/features/user/components/skeletons/HomeSkeleton'
import Home from '@/features/user/pages/Home'
import FAQs from '@/features/user/pages/FAQs'
import History from '@/features/user/pages/History'
import NewPost from '@/features/user/pages/NewPost'
import SearchItem from '@/features/user/pages/SearchItem'
import Notifications from '@/features/user/pages/Notifications'
import AccountPage from '@/features/user/pages/AccountPage'
import Settings from '@/features/user/pages/Settings'
import ExpandedPost from '@/features/posts/pages/ExpandedPost'

const HistoryFallback = () => <div className='p-4'>Loading History…</div>
const NewPostFallback = () => <div className='p-4'>Preparing form…</div>
const DefaultFallback = () => <div className='p-4'>Loading…</div>

export default function UserRoutes () {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path='/user/post/view/:postId' render={() => <ExpandedPost />} />
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
          path='/user/account'
          render={() => (
            <Suspense fallback={<DefaultFallback />}>
              <AccountPage />
            </Suspense>
          )}
        />
        <Route
          path='/user/notifications'
          render={() => (
            <Suspense fallback={<DefaultFallback />}>
              <Notifications />
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
