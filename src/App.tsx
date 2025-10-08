import React from 'react'
import {
  IonApp,
  IonRouterOutlet,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton
} from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route, Redirect } from 'react-router-dom'
import { setupIonicReact } from '@ionic/react'

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

import ProtectedRoute from './components/ProtectedRoute'
import UserRoutes from './routes/UserRoutes'
setupIonicReact()

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
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
)

export default App
