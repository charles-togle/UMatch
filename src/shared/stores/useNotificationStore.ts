import { create } from 'zustand'

interface NotificationState {
  /**
   * Array of post IDs from notifications (similar items)
   */
  notificationPostIds: string[]

  /**
   * Set notification post IDs
   */
  setNotifications: (postIds: string[]) => void

  /**
   * Add a single post ID to notifications
   */
  addNotification: (postId: string) => void

  /**
   * Remove a post ID from notifications
   */
  removeNotification: (postId: string) => void

  /**
   * Clear all notification post IDs
   */
  clearNotifications: () => void

  /**
   * Check if a post ID exists in notifications
   */
  hasPostId: (postId: string) => boolean

  /**
   * Get count of notification post IDs
   */
  getCount: () => number
}

/**
 * Global store for notification-related post IDs (array of post IDs)
 * Used to store and manage similar items that should be shown in notifications
 */
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notificationPostIds: [],

  setNotifications: (postIds: string[]) => {
    set({ notificationPostIds: postIds })
  },

  addNotification: (postId: string) => {
    set(state => ({
      notificationPostIds: state.notificationPostIds.includes(postId)
        ? state.notificationPostIds
        : [...state.notificationPostIds, postId]
    }))
  },

  removeNotification: (postId: string) => {
    set(state => ({
      notificationPostIds: state.notificationPostIds.filter(id => id !== postId)
    }))
  },

  clearNotifications: () => {
    set({ notificationPostIds: [] })
  },

  hasPostId: (postId: string) => {
    return get().notificationPostIds.includes(postId)
  },

  getCount: () => {
    return get().notificationPostIds.length
  }
}))
