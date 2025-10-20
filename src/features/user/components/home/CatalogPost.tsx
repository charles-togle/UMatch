import React, { lazy, memo } from 'react'
const LazyImage = lazy(() => import('@/shared/components/LazyImage'))
import {
  IonCard,
  IonCardContent,
  IonItem,
  IonAvatar,
  IonLabel,
  IonIcon,
  IonButtons,
  IonButton,
  IonChip,
  IonText
} from '@ionic/react'
import { ellipsisVertical, personCircle } from 'ionicons/icons'

export type Chip = {
  label: string
  icon?: string
}

export type CatalogPostProps = {
  username?: string
  itemName?: string
  description?: string
  lastSeen?: string
  chips?: Chip[]
  extraCountLabel?: string
  imageUrl?: string
  className?: string
}

const CatalogPost: React.FC<CatalogPostProps> = ({
  username = 'Profile Picture and Username',
  itemName = 'Item Name',
  description = 'Some really really really really long description that should be truncated.',
  lastSeen = 'MM/DD/YYYY    00:00 AM/PM',
  chips = [
    { label: 'Chip label', icon: personCircle },
    { label: 'Chip label', icon: personCircle }
  ],
  extraCountLabel = '5+',
  imageUrl,
  className = ''
}) => {
  return (
    <IonCard
      className={`rounded-2xl shadow-md border border-gray-200 font-default-font overflow-hidden ${className}`}
    >
      {/* Header with avatar + username + kebab menu */}
      <IonItem lines='none' className='py-2 -mx-2'>
        <IonAvatar slot='start'>
          <IonIcon
            icon={personCircle}
            className='w-full h-full text-gray-400'
          />
        </IonAvatar>
        <IonLabel>
          <div className='font-semibold text-umak-blue'>
            <p>{username}</p>
          </div>
        </IonLabel>
        <IonButtons slot='end'>
          <IonButton fill='clear' color='medium' aria-label='More options'>
            <IonIcon icon={ellipsisVertical} />
          </IonButton>
        </IonButtons>
      </IonItem>
      <div className='h-px bg-black mx-3'></div>

      <IonCardContent className='p-3'>
        <div className='text-xl font-bold mb-1 text-gray-900'>{itemName}</div>
        <p className='text-gray-700 mb-3 leading-snug'>{description}</p>
        <React.Suspense
          fallback={
            <div className='h-56 bg-gray-50 border border-gray-200 rounded-xl animate-pulse' />
          }
        >
          <LazyImage
            src={imageUrl}
            alt={itemName}
            className='h-56 rounded-xl'
          />
        </React.Suspense>

        <div className='flex items-center gap-2 mt-3 text-xs text-gray-500'>
          <IonText>
            <strong>Last seen:</strong>
          </IonText>
          <IonText>{lastSeen}</IonText>
        </div>

        <div className='flex flex-wrap items-center gap-2 mt-3'>
          {chips.map((c, i) => (
            <IonChip
              key={i}
              className='bg-blue-900 text-white font-default-font px-2 '
              outline={false}
              color='primary'
            >
              {c.icon && <IonIcon icon={c.icon} className='mr-1' />}{' '}
              <div className='text-xs'>{c.label}</div>
            </IonChip>
          ))}
          <IonText className='font-semibold ml-1'>{extraCountLabel}</IonText>
        </div>
      </IonCardContent>
    </IonCard>
  )
}

export default memo(CatalogPost)
