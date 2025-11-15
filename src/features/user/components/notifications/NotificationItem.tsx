// components/user/notifications/NotificationItem.tsx
import React, { useMemo, useState, useRef, useEffect } from 'react'
import { IonIcon, IonActionSheet, IonButton } from '@ionic/react'
import {
  shieldOutline,
  checkmarkCircleOutline,
  checkmarkDoneCircleOutline,
  mailOutline,
  ellipsisVertical,
  megaphone
} from 'ionicons/icons'
import { useNavigation } from '@/shared/hooks/useNavigation'

export type NotificationType =
  | 'info'
  | 'found'
  | 'resolved'
  | 'progress'
  | 'announcement'

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
  read?: boolean
  actions?: ActionItem[]
  actionSheetHeader?: string
  notificationId?: string
  handleMarkAsRead?: (notificationId: string) => void
  href?: string
}

const iconForType = (type: NotificationType) => {
  switch (type) {
    case 'info':
      return { icon: shieldOutline, colorClass: 'text-slate-700' }
    case 'announcement':
      return { icon: megaphone, colorClass: 'text-umak-blue' }
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
  read = false,
  actions = [],
  actionSheetHeader = 'Actions',
  notificationId,
  handleMarkAsRead,
  href
}) => {
  const [open, setOpen] = useState(false)
  const { icon, colorClass } = iconForType(type)
  const [expanded, setExpanded] = useState(false)

  // Long-press handling
  const longPressTimeout = useRef<number | null>(null)
  const longPressTriggered = useRef(false)
  const [holding, setHolding] = useState(false)

  const { navigate } = useNavigation()
  useEffect(() => {
    return () => {
      if (longPressTimeout.current) {
        window.clearTimeout(longPressTimeout.current)
        longPressTimeout.current = null
      }
    }
  }, [])

  const startPress = () => {
    longPressTriggered.current = false
    // indicate the user started pressing
    setHolding(true)
    longPressTimeout.current = window.setTimeout(() => {
      longPressTriggered.current = true
      setOpen(true)
    }, 500) as unknown as number
  }

  const clearPress = () => {
    if (longPressTimeout.current) {
      window.clearTimeout(longPressTimeout.current)
      longPressTimeout.current = null
    }
    // remove holding visual
    setHolding(false)
  }

  const handlePointerDown = () => startPress()
  const handlePointerUp = () => clearPress()
  const handlePointerLeave = () => clearPress()
  const handleClick = () => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false
      return
    }
    setExpanded(prev => !prev)
  }

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

  const expandedClassName = expanded
    ? 'line-clamp-none'
    : 'line-clamp-2 truncate'

  return (
    <>
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onClick={() => {
          if (longPressTriggered.current) {
            // ignore click if it was a long-press
            longPressTriggered.current = false
            return
          }

          // If href is provided, navigate to it
          if (href) {
            handleMarkAsRead && handleMarkAsRead(notificationId!)
            navigate(href)
            return
          }

          // default toggle expand
          handleClick()
          handleMarkAsRead && handleMarkAsRead(notificationId!)
        }}
        className={`flex items-start gap-3 px-3 py-3 border-b border-slate-200 ${
          read ? 'bg-slate-50 opacity-70' : ''
        } ${holding ? 'bg-black/10' : ''}`}
      >
        {/* left icon */}
        <div className={`mt-0.5 ${colorClass}`}>
          <IonIcon icon={icon} style={{ fontSize: 22 }} />
        </div>

        {/* text */}
        <div className='flex-1 min-w-0'>
          <div
            className={`font-default-font text-[15px] ${
              read ? 'font-default' : 'font-semibold'
            } text-slate-900 ${expandedClassName}`}
          >
            {title}
          </div>
          <div
            className={`font-default-font text-[13px] text-slate-600 ${expandedClassName}`}
          >
            {description}
          </div>
        </div>

        {/* actions (three dots) */}
        <IonButton
          onClick={e => {
            // Prevent the parent click which toggles expand
            e.stopPropagation()
            setOpen(true)
          }}
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
