import {
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonIcon
} from '@ionic/react'
import { useNavigation } from '@/shared/hooks/useNavigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { logOut } from 'ionicons/icons'
import Header from '@/shared/components/Header'
import SettingsList from '@/shared/components/SettingsList'

import { useRef, useEffect } from 'react'

export default function Settings () {
  const { navigate } = useNavigation()
  const { logout } = useAuth()
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  return (
    <>
      <Header logoShown={true} />
      <SettingsList />
      <div>
        <IonCard className='mt-3 mb-20 bg-transparent shadow-none'>
          <IonCardContent>
            <IonList>
              <IonItem
                button
                style={{ '--background': 'var(--color-umak-red)' }}
                className='text-white font-default-font rounded-lg'
                onClick={handleLogout}
              >
                <IonIcon icon={logOut} className='mr-3 text-white' />
                <IonLabel className='text-red-600'>Log out</IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>
      </div>
    </>
  )
}
