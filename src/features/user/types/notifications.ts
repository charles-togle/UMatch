// types/notifications.ts
export type NotificationType = 'info' | 'found' | 'resolved' | 'progress'

export interface NotificationData {
  id: number
  type: NotificationType
  title: string
  description: string
}

export interface ActionItem {
  color: 'danger' | 'primary' // "danger" → umak-blue, "primary" → slate-900 (per your spec)
  type: string
  onClick: () => void
  icon: string // ionicon name, e.g. trashOutline
}
