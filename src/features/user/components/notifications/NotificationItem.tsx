// components/user/notifications/NotificationItem.tsx
import React, { useMemo, useState } from 'react'
import { IonIcon, IonActionSheet, IonButton } from '@ionic/react'
import {
  shieldOutline,
  checkmarkCircleOutline,
  checkmarkDoneCircleOutline,
  mailOutline,
  ellipsisVertical
} from 'ionicons/icons'

export type NotificationType = 'info' | 'found' | 'resolved' | 'progress'

export type ActionItem = {
  color: 'danger' | 'primary' // danger => umak-blue, primary => slate-900
  type: string // label text shown in the action sheet
  onClick: () => void
  icon?: string // optional ionicon, e.g. trashOutline
}

interface NotificationItemProps {
  type: NotificationType
  title: string
  description: string
  actions?: ActionItem[]
  actionSheetHeader?: string
}

const iconForType = (type: NotificationType) => {
  switch (type) {
    case 'info':
      return { icon: shieldOutline, colorClass: 'text-slate-700' }
    case 'found':
      return { icon: checkmarkCircleOutline, colorClass: 'text-green-600' }
    case 'resolved':
      return { icon: checkmarkDoneCircleOutline, colorClass: 'text-green-600' }
    case 'progress':
      return { icon: mailOutline, colorClass: 'text-orange-500' }
    default:
      return { icon: shieldOutline, colorClass: 'text-slate-700' }
  }
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  type,
  title,
  description,
  actions = [],
  actionSheetHeader = 'Actions'
}) => {
  const [open, setOpen] = useState(false)
  const { icon, colorClass } = iconForType(type)

  // Map your ActionItem[] to IonActionSheet buttons
  const sheetButtons = useMemo(
    () =>
      actions.map(a => ({
        text: a.type, // <-- uses "type" as the visible label
        icon: a.icon, // optional
        handler: () => a.onClick(),
        cssClass:
          a.color === 'danger'
            ? ['font-default-font', 'text-[var(--color-umak-blue)]']
            : ['font-default-font', 'text-slate-900']
      })),
    [actions]
  )

  return (
    <>
      <div className='flex items-start gap-3 px-3 py-3 border-b border-slate-200'>
        {/* left icon */}
        <div className={`mt-0.5 ${colorClass}`}>
          <IonIcon icon={icon} style={{ fontSize: 22 }} />
        </div>

        {/* text */}
        <div className='flex-1 min-w-0'>
          <div className='font-default-font text-[15px] font-semibold text-slate-900 truncate'>
            {title}
          </div>
          <div className='font-default-font text-[13px] text-slate-600 truncate'>
            {description}
          </div>
        </div>

        {/* actions (three dots) */}
        <IonButton
          onClick={() => setOpen(true)}
          aria-label='Actions'
          fill='clear'
          size='small'
          className='m-0 p-0'
          style={{
            '--background': 'transparent',
            '--background-hover': 'transparent',
            '--background-activated': 'transparent',
            '--background-focused': 'transparent',
            '--box-shadow': 'none',
            '--ripple-color': 'transparent'
          }}
        >
          <IonIcon
            icon={ellipsisVertical}
            slot='icon-only'
            className='text-slate-700'
          />
        </IonButton>
      </div>

      {/* Ionic Action Sheet */}
      <IonActionSheet
        isOpen={open}
        header={actionSheetHeader}
        onDidDismiss={() => setOpen(false)}
        buttons={[
          ...sheetButtons,
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: ['font-default-font', 'text-slate-500']
          }
        ]}
      />
    </>
  )
}

export default NotificationItem
