import { IonPage, IonContent } from '@ionic/react'
import CatalogPost from '../home/CatalogPost'
import Header from '@/shared/components/Header'

export default function HomeSkeleton () {
  return (
    <IonPage>
      <IonContent>
        <div className='h-screen overflow-y-hidden pointer-events-none'>
          <Header logoShown={true}>
            <div></div>
          </Header>
          <div className='flex flex-col gap-4 animate-pulse'>
            {[...Array(2)].map((_, index) => (
              <CatalogPost
                description='...'
                itemName='...'
                chips={[{ label: '.......' }, { label: '........' }]}
                extraCountLabel='+000'
                lastSeen='...'
                key={index}
              />
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}
