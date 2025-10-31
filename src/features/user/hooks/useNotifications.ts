import { useCallback, useState } from 'react'
import { supabase } from '@/shared/lib/supabase'
import createCache from '@/shared/lib/cache'
import type { NotificationData } from '@/features/posts/types/notifications'
import { useUser } from '@/features/auth/contexts/UserContext'

type UseNotificationsReturn = {
  notifications: NotificationData[]
  loading: boolean
  getAllNotifications: (userId: string) => Promise<NotificationData[]>
  markAsRead: (notificationId: string) => Promise<boolean>
  deleteNotification: (notificationId: string) => Promise<boolean>
  getNotificationCount: (userId: string) => Promise<number>
  sendNotificationToSelf: (params: {
    message: string
    title: string
    type: 'info' | 'found' | 'resolved' | 'progress'
    data?: any
  }) => Promise<void>
}

/**
 * Hook to manage user notifications using the `notification_table` schema.
 *
 * DB schema (summary):
 * - notification_id uuid PK
 * - created_at timestamptz default now()
 * - description text
 * - item_id uuid
 * - sent_to uuid
 * - sent_by uuid
 * - is_read boolean
 * - type text
 * - data jsonb
 */
export default function useNotifications (): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [ownDeviceToken, setOwnDeviceToken] = useState<string | null>(null)
  const { user } = useUser()

  // helper to create a per-user notifications cache (scoped by user id)

  const getOwnDeviceToken = useCallback(async (): Promise<string | null> => {
    try {
      const userId = user?.user_id
      if (!userId) {
        console.warn('No user ID available to fetch device token')
        return null
      }
      const { data, error } = await supabase
        .from('user_table')
        .select('notification_token')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching own device token:', error)
        return null
      }
      if (data && data.notification_token) {
        setOwnDeviceToken(data.notification_token)
        return data.notification_token
      } else {
        return null
      }
    } catch (e) {
      console.error('Error fetching own device token:', e)
      return null
    }
  }, [user])

  const sendNotificationToSelf = useCallback(
    async ({
      message,
      title,
      type,
      data
    }: {
      message: string
      title: string
      type: 'info' | 'found' | 'resolved' | 'progress'
      data?: any
    }) => {
      try {
        let token = ownDeviceToken
        if (!token) {
          token = await getOwnDeviceToken()
        }
        if (!token) {
          console.warn('No valid device token available for self-notification')
          return
        }
        await supabase.functions.invoke('send-notification', {
          body: {
            token: token,
            title: title,
            body: message,
            type: type,
            data: data || {}
          }
        })
      } catch (error) {
        console.error('Error sending notification to self:', error)
      }
    },
    [ownDeviceToken, getOwnDeviceToken]
  )

  const makeCacheForUser = (userId: string) =>
    createCache<NotificationData>({
      keys: {
        loadedKey: `LoadedNotifications:${userId}`,
        cacheKey: `CachedNotifications:${userId}`
      },
      idSelector: n => n.notification_id
    })

  const getNotificationCount = useCallback(
    async (userId: string): Promise<number> => {
      try {

        const { count, error } = await supabase
          .from('notification_table')
          .select('notification_id', { count: 'exact', head: true })
          .eq('sent_to', userId)
          .eq('is_read', false)

        if (error) {
          console.error('Error fetching notification count:', error)
          return 0
        }
        return count ?? 0
      } catch (error) {
        console.error('Error fetching notification count:', error)
        return 0
      }
    },
    []
  )

  const getAllNotifications = useCallback(async (userId: string) => {
    setLoading(true)
    try {
      if (userId === '') {
        console.warn('No user ID provided for fetching notifications')
        return []
      }
      const cache = makeCacheForUser(userId)
      const { data, error } = await supabase
        .from('notification_table')
        .select(
          'notification_id, type, description, is_read, data, created_at, sent_to, sent_by, item_id'
        )
        .eq('sent_to', userId)
        .order('created_at', { ascending: false })
      if (error) {
        console.error(
          'Failed to load notifications, falling back to cache',
          error
        )
        // fallback to cache if available
        const cached = await cache.loadCache()
        setNotifications(cached)
        return cached
      }

      const mapped: NotificationData[] = (data ?? []).map((r: any) => ({
        notification_id: r.notification_id,
        type: r.type,
        description: r.description,
        is_read: r.is_read,
        created_at: r.created_at,
        data: r.data,
        sent_to: r.sent_to,
        sent_by: r.sent_by,
        item_id: r.item_id
      }))

      // update in-memory and cache
      setNotifications(mapped)
      try {
        await cache.saveCache(mapped)
        const ids = new Set(mapped.map(m => m.notification_id))
        await cache.saveLoadedIds(ids)
      } catch (e) {
        // cache failures shouldn't block
        console.warn('Failed to save notifications to cache', e)
      }

      return mapped
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notification_table')
        .update({ is_read: true })
        .eq('notification_id', notificationId)

      if (error) {
        console.error('Failed to mark notification read', error)
        return false
      }
      setNotifications(prev => {
        const updated = prev.map(n =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
        // also update cache for the user(s) represented in prev
        ;(async () => {
          try {
            // try to update cache for the notification's recipient (if we can find it)
            const target = updated.find(
              u => u.notification_id === notificationId
            )
            if (target && target.sent_to) {
              const cache = makeCacheForUser(target.sent_to)
              const cached = await cache.loadCache()
              const merged = cached.map(c =>
                c.notification_id === notificationId
                  ? { ...c, is_read: true }
                  : c
              )
              await cache.saveCache(merged)
            }
          } catch (e) {
            /* ignore cache write errors */
          }
        })()
        return updated
      })
      return true
    } catch (e) {
      console.error('Exception marking notification read', e)
      return false
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notification_table')
        .delete()
        .eq('notification_id', notificationId)

      if (error) {
        console.error('Failed to delete notification', error)
        return false
      }
      setNotifications(prev => {
        const updated = prev.filter(n => n.notification_id !== notificationId)
        ;(async () => {
          try {
            // Update cache for affected user(s)
            const removed = prev.find(p => p.notification_id === notificationId)
            if (removed && removed.sent_to) {
              const cache = makeCacheForUser(removed.sent_to)
              const cached = await cache.loadCache()
              const merged = cached.filter(
                c => c.notification_id !== notificationId
              )
              await cache.saveCache(merged)
            }
          } catch (e) {
            // ignore cache errors
          }
        })()
        return updated
      })
      return true
    } catch (e) {
      console.error('Exception deleting notification', e)
      return false
    }
  }, [])

  return {
    notifications,
    loading,
    getAllNotifications,
    markAsRead,
    deleteNotification,
    getNotificationCount,
    sendNotificationToSelf
  }
}
