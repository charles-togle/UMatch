import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonIcon,
  IonButtons,
  IonButton
} from '@ionic/react'
import { notifications, personCircle } from 'ionicons/icons'
import { useCallback } from 'react'
import { useState } from 'react'
import Header from '@/components/shared/Header'
import CatalogPost from '@/components/user/home/CatalogPost'

const CatalogHeader = ({
  searchInput,
  setSearchInput
}: {
  searchInput: string
  setSearchInput: (value: string) => void
}) => {
  return (
    <Header>
      <IonSearchbar
        placeholder='Search'
        value={searchInput}
        showClearButton='focus'
        debounce={1000}
        onIonInput={event => setSearchInput(event.detail.value!)}
        style={
          {
            ['--border-radius']: '0.5rem'
          } as React.CSSProperties
        }
      />
      <IonButtons slot='end'>
        <IonButton>
          <IonIcon
            icon={notifications}
            slot='icon-only'
            className='text-white'
          />
        </IonButton>
      </IonButtons>
      <IonButtons slot='end'>
        <IonButton>
          <IonIcon
            icon={personCircle}
            slot='icon-only'
            className='text-white'
          />
        </IonButton>
      </IonButtons>
    </Header>
  )
}

export default function Catalog () {
  const [searchInput, setSearchInput] = useState<string>('')

  const handleRefresh = useCallback((event: CustomEvent) => {
    window.location.reload()
    event.detail.complete()
  }, [])

  return (
    <>
      <CatalogHeader
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />
      <IonContent className='ion-padding'>
        <IonRefresher slot='fixed' onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <CatalogPost></CatalogPost>
      </IonContent>
    </>
  )
}
