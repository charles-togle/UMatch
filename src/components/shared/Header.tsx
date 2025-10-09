import ohsoIcon from '@/assets/icon_ohso.svg'
import {
  IonHeader,
  IonToolbar,
  IonIcon,
  IonButtons,
  IonButton
} from '@ionic/react'

const toolbarStyle = {
  ['--background']: 'var(--color-umak-blue, #1D2981)'
} as React.CSSProperties

export default function Header ({ children }: { children: React.ReactNode }) {
  return (
    <IonHeader>
      <IonToolbar style={toolbarStyle}>
        <IonButtons slot='start'>
          <IonButton>
            <IonIcon icon={ohsoIcon} slot='icon-only' className='text-white' />
          </IonButton>
        </IonButtons>
        {children}
      </IonToolbar>
    </IonHeader>
  )
}
