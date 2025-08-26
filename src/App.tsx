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

setupIonicReact()

const DashboardPage: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Dashboard</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className='ion-padding'>
      <h2>Welcome to the Dashboard!</h2>
    </IonContent>
    <IonToolbar slot='bottom'>
      <IonButton expand='block' routerLink='/dashboard'>
        Dashboard
      </IonButton>
      <IonButton expand='block' routerLink='/profile'>
        Profile
      </IonButton>
      <IonButton expand='block' routerLink='/settings'>
        Settings
      </IonButton>
    </IonToolbar>
  </IonPage>
)

const ProfilePage: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Profile</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className='ion-padding'>
      <h2>Your Profile</h2>
    </IonContent>
    <IonToolbar slot='bottom'>
      <IonButton expand='block' routerLink='/dashboard'>
        Dashboard
      </IonButton>
      <IonButton expand='block' routerLink='/profile'>
        Profile
      </IonButton>
      <IonButton expand='block' routerLink='/settings'>
        Settings
      </IonButton>
    </IonToolbar>
  </IonPage>
)

const SettingsPage: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Settings</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className='ion-padding'>
      <h2>Settings</h2>
    </IonContent>
    <IonToolbar slot='bottom'>
      <IonButton expand='block' routerLink='/dashboard'>
        Dashboard
      </IonButton>
      <IonButton expand='block' routerLink='/profile'>
        Profile
      </IonButton>
      <IonButton expand='block' routerLink='/settings'>
        Settings
      </IonButton>
    </IonToolbar>
  </IonPage>
)

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path='/dashboard' component={DashboardPage} exact />
        <Route path='/profile' component={ProfilePage} exact />
        <Route path='/settings' component={SettingsPage} exact />
        <Redirect exact from='/' to='/dashboard' />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
)

export default App
