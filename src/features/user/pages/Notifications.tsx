// pages/user/Notifications.tsx
import { useState } from 'react'
import {
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonActionSheet
} from '@ionic/react'
import Header from '@/shared/components/Header'
import NotificationItem from '@/features/user/components/notifications/NotificationItem'
import type {
  NotificationData,
  ActionItem
} from '@/features/posts/types/notifications'
import {
  personCircle,
  trashOutline,
  checkmarkOutline,
  notifications,
  ellipsisVertical
} from 'ionicons/icons'

// Extend to include id & read status for local state
type Notif = NotificationData & { id: number; read?: boolean }

const seed: Notif[] = [
  {
    id: 1,
    type: 'info',
    title: 'Notification Title',
    description: 'Description'
  },
  {
    id: 2,
    type: 'found',
    title: 'Item Found',
    description: 'An item you’ve been looking for has been identified.'
  },
  {
    id: 3,
    type: 'resolved',
    title: 'Case Resolved',
    description: 'An item you’ve reported has been returned.'
  },
  {
    id: 4,
    type: 'progress',
    title: 'Report in Progress',
    description: 'The report you’ve submitted will be reviewed soon.'
  }
]

export default function Notifications () {
  const [items, setItems] = useState<Notif[]>(seed)

  // Per-item actions
  const handleNotificationDelete = (id: number) => {
    setItems(prev => prev.filter(n => n.id !== id))
  }
  const handleMarkAsRead = (id: number) => {
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }

  // Bulk actions (horizontal ellipsis)
  const [showBulkSheet, setShowBulkSheet] = useState(false)
  const handleDeleteAll = () => setItems([])
  const handleMarkAllRead = () =>
    setItems(prev => prev.map(n => ({ ...n, read: true })))

  return (
    <IonContent className='bg-gray-50'>
      {/* App header you already have */}
      <Header logoShown={true}>
        <IonButtons slot='end'>
          <IonButton className='relative'>
            <IonIcon
              icon={notifications}
              slot='icon-only'
              className=' text-2xl text-amber-500'
            />
          </IonButton>
        </IonButtons>
        {/* Profile Icon */}
        <IonButtons slot='end'>
          <IonButton>
            <IonIcon
              icon={personCircle}
              slot='icon-only'
              className='text-white text-2xl'
            />
          </IonButton>
        </IonButtons>
      </Header>

      {/* Section header with horizontal ellipsis for list-level actions */}
      <div className='bg-white border-y border-slate-200 px-3 py-2 font-default-font'>
        <div className='flex items-center justify-between'>
          <div className='text-[13px] text-slate-600'>Notifications</div>

          <IonButton
            onClick={() => setShowBulkSheet(true)}
            aria-label='List actions'
            fill='clear'
            size='small'
            className='m-0 p-0'
            style={
              {
                '--background': 'transparent',
                '--background-hover': 'transparent',
                '--background-activated': 'transparent',
                '--background-focused': 'transparent',
                '--box-shadow': 'none',
                '--ripple-color': 'transparent'
              } as React.CSSProperties
            }
          >
            <IonIcon
              icon={ellipsisVertical}
              slot='icon-only'
              className='text-slate-700'
            />
          </IonButton>
        </div>
      </div>

      {/* Notifications list */}
      <div className='bg-white'>
        {items.length === 0 ? (
          <div className='px-4 py-10 text-center text-slate-500 font-default-font text-sm'>
            You’re all caught up.
          </div>
        ) : (
          items.map(n => {
            const actions: ActionItem[] = [
              {
                color: 'danger', // per spec: danger => umak-blue text (we style via cssClass in NotificationItem)
                type: 'Delete notification',
                onClick: () => handleNotificationDelete(n.id),
                icon: trashOutline
              },
              {
                color: 'primary', // slate-900 text
                type: 'Mark as read',
                onClick: () => handleMarkAsRead(n.id),
                icon: checkmarkOutline
              }
            ]
            return (
              <NotificationItem
                key={n.id}
                type={n.type}
                title={n.title}
                description={n.description}
                actions={actions}
              />
            )
          })
        )}
      </div>

      {/* Bulk Action Sheet (Delete all / Mark all as read) */}
      <IonActionSheet
        isOpen={showBulkSheet}
        header='Notifications'
        onDidDismiss={() => setShowBulkSheet(false)}
        buttons={[
          {
            text: 'Delete all',
            icon: trashOutline,
            handler: handleDeleteAll,
            // "danger" mapping → umak-blue text
            cssClass: ['font-default-font', 'text-[var(--color-umak-blue)]']
          },
          {
            text: 'Mark all as read',
            icon: checkmarkOutline,
            handler: handleMarkAllRead,
            cssClass: ['font-default-font', 'text-slate-900']
          },
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: ['font-default-font', 'text-slate-500']
          }
        ]}
      />
    </IonContent>
  )
}
