import ohsoIcon from '@/shared/assets/umak-ohso.svg'
import {
  IonHeader,
  IonToolbar,
  IonIcon,
  IonButtons,
  IonButton,
  IonBadge
} from '@ionic/react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { cachedFileExists } from '../utils/fileUtils'
import { getCachedImage } from '../utils/fileUtils'
import { useNavigation } from '../hooks/useNavigation'
import { notifications, personCircle } from 'ionicons/icons'

const toolbarStyle = {
  ['--background']: 'var(--color-umak-blue, #1D2981)'
} as React.CSSProperties

export default function Header ({
  children,
  logoShown,
  unreadCount,
  isProfileAndNotificationShown = true
}: {
  children?: React.ReactNode
  logoShown: boolean
  unreadCount?: number
  isProfileAndNotificationShown?: boolean
}) {
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null)
  const profilePicRef = useRef<string | null>(null)
  const { navigate } = useNavigation()
  useEffect(() => {
    const getProfilePicture = async () => {
      if (profilePicRef.current) return
      const exists = await cachedFileExists(
        'profilePicture.webp',
        'cache/images'
      )
      if (exists) {
        const url = await getCachedImage('profilePicture.webp', 'cache/images')
        profilePicRef.current = url
        setProfilePicUrl(url)
      }
    }
    getProfilePicture()
  }, [])
  const handleNotificationClick = useCallback(() => {
    navigate('/user/notifications')
  }, [navigate])
  const handleProfileClick = useCallback(() => {
    navigate('/user/account')
  }, [navigate])
  return (
    <IonHeader className='ion-no-border'>
      <IonToolbar style={toolbarStyle}>
        <IonButtons slot='start'>
          {logoShown && (
            <IonButton>
              <IonIcon
                icon={ohsoIcon}
                slot='icon-only'
                size='large'
                className='text-white'
              />
            </IonButton>
          )}
        </IonButtons>
        {children}
        {isProfileAndNotificationShown && (
          <>
            {/* Notification Icon with Badge */}
            <IonButtons slot='end'>
              <IonButton className='relative' onClick={handleNotificationClick}>
                <IonIcon
                  icon={notifications}
                  slot='icon-only'
                  className='text-white text-2xl'
                />
                {unreadCount && unreadCount > 0 && (
                  <IonBadge
                    color='danger'
                    className='absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full'
                  >
                    {unreadCount}
                  </IonBadge>
                )}
              </IonButton>
            </IonButtons>

            {/* Profile Icon */}
            <IonButtons slot='end'>
              <IonButton onClick={handleProfileClick}>
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt='Profile'
                    className='w-8 h-8 rounded-full object-cover'
                  />
                ) : (
                  <IonIcon
                    icon={personCircle}
                    slot='icon-only'
                    className='text-white text-2xl'
                  />
                )}
              </IonButton>
            </IonButtons>
          </>
        )}
      </IonToolbar>
    </IonHeader>
  )
}
