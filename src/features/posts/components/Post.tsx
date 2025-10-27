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
  IonText,
  IonChip
} from '@ionic/react'
import { ellipsisVertical, personCircle } from 'ionicons/icons'

export type CatalogPostProps = {
  username?: string
  user_profile_picture_url?: string | null
  itemName?: string
  description?: string
  category?: string
  lastSeen?: string
  imageUrl?: string
  locationLastSeenAt?: string
  className?: string
  onKebabButtonlick?: () => void | undefined
  itemStatus?: string | null
}

const Post: React.FC<CatalogPostProps> = ({
  username = 'Profile Picture and Username',
  user_profile_picture_url = null,
  itemName = 'Item Name',
  description = 'Some really really really really long description that should be truncated.',
  lastSeen = 'MM/DD/YYYY 00:00 AM/PM',
  imageUrl,
  className = '',
  category,
  locationLastSeenAt = 'Location where item was last seen',
  onKebabButtonlick = undefined,
  itemStatus = null
}) => {
  const normalizedStatus = (itemStatus || '').toLowerCase()
  const statusColorClass =
    normalizedStatus === 'unclaimed'
      ? 'text-red-600'
      : normalizedStatus === 'claimed'
      ? 'text-green-600'
      : ''
  return (
    <IonCard
      className={`shadow-md border border-gray-200 font-default-font  px-2 ${className}`}
    >
      {/* Header with avatar + username + kebab menu */}
      <IonItem lines='none' className='py-2 -mx-2'>
        <IonAvatar slot='start'>
          {user_profile_picture_url ? (
            <img
              src={user_profile_picture_url}
              alt={username}
              className='w-full h-full object-cover'
            />
          ) : (
            <IonIcon
              icon={personCircle}
              className='w-full h-full text-gray-400'
            />
          )}
        </IonAvatar>
        <IonLabel>
          <div className='font-semibold text-umak-blue pl-3'>
            <p>{username}</p>
          </div>
        </IonLabel>
        <IonButtons slot='end'>
          <IonButton
            fill='clear'
            color='medium'
            aria-label='More options'
            onClick={() => onKebabButtonlick?.()}
          >
            <IonIcon icon={ellipsisVertical} />
          </IonButton>
        </IonButtons>
      </IonItem>
      <div className='h-px bg-black mx-3'></div>

      <IonCardContent className='-mt-2'>
        <div className='text-xl font-bold text-gray-900 flex justify-between items-center'>
          <span>{itemName}</span>{' '}
          <span className={`text-sm ${statusColorClass}`}>
            {itemStatus
              ? itemStatus.charAt(0).toUpperCase() + itemStatus.slice(1)
              : null}
          </span>
        </div>
        <div className='h-px w-full my-2 bg-gray-300' />
        <p className='text-slate-900 pb-2 leading-snug line-clamp-2'>
          {description}
        </p>
        <React.Suspense
          fallback={
            <div className='h-56 bg-gray-50 border border-gray-200 rounded-xl animate-pulse' />
          }
        >
          <div className='max-h-128 flex justify-center items-center overflow-hidden  rounded-xl'>
            <LazyImage src={imageUrl} alt={itemName} />
          </div>
        </React.Suspense>
        <div className='flex flex-col my-3 text-xl text-slate-900'>
          <IonText class='font-extrabold'>
            <strong>Last seen:</strong>
          </IonText>
          <IonText className='text-base '>{lastSeen}</IonText>
        </div>
        {category && (
          <div className='flex flex-col my-3 text-xl text-slate-900'>
            <IonText class='font-extrabold'>
              <strong>Last seen:</strong>
            </IonText>
            <IonChip className='w-fit bg-umak-blue text-white px-10 mt-1'>
              {category}
            </IonChip>
          </div>
        )}
        <div className='flex flex-col text-xl text-slate-900'>
          <IonText class='font-extrabold'>
            <strong>Location:</strong>
          </IonText>
          <IonText className='text-base'>{locationLastSeenAt}</IonText>
        </div>
      </IonCardContent>
    </IonCard>
  )
}

export default memo(Post)
