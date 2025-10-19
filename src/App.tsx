import React from 'react'
import { IonApp, IonRouterOutlet } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route, Redirect } from 'react-router-dom'
import { setupIonicReact } from '@ionic/react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ProtectedRoute from './components/ProtectedRoute'
import UserRoutes from './routes/UserRoutes'
import Auth from './pages/shared/Auth'
import StartupLoading from './pages/shared/StartupLoading'

import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'
import '@/styles/tailwind.css'
import HomeSkeleton from './components/user/skeletons/HomeSkeleton'

setupIonicReact()

const App: React.FC = () => {
  const googleWebClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  return (
    <GoogleOAuthProvider
      clientId={googleWebClientId || 'YOUR_GOOGLE_CLIENT_ID_HERE'}
    >
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path='/test' render={() => <HomeSkeleton />} />
            <Route exact path='/' render={() => <Redirect to='/preload' />} />
            <Route path='/preload' render={() => <StartupLoading />} />
            <Route path='/auth' render={() => <Auth />} />
            <Route
              path='/user/*'
              render={() => (
                <ProtectedRoute allowedRoles={['user']}>
                  <UserRoutes />
                </ProtectedRoute>
              )}
            />
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </GoogleOAuthProvider>
  )
}

export default App
