import React from 'react'
import { IonApp, IonRouterOutlet } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route, Redirect } from 'react-router-dom'
import { setupIonicReact } from '@ionic/react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Capacitor } from '@capacitor/core'
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

setupIonicReact()

const App: React.FC = () => {
  const usingWeb = Capacitor.getPlatform() === 'web'
  return (
    <GoogleOAuthProvider
      clientId={
        usingWeb
          ? import.meta.env.VITE_GOOGLE_CLIENT_ID
          : import.meta.env.VITE_GOOGLE_CLIENT_ID_MOBILE
      }
    >
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
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
