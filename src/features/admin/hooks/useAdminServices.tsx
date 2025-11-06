import { supabase } from '@/shared/lib/supabase'
import type { User } from '@/features/auth/contexts/UserContext'
import { useAuditLogs } from '@/shared/hooks/useAuditLogs'
import { useUser } from '@/features/auth/contexts/UserContext'
import { useState } from 'react'

export function useAdminServices () {
  const { insertAuditLog } = useAuditLogs()
  const { getUser } = useUser()
  const [user, setUser] = useState<User | null>(null)

  const getAllStaffAndAdmin = async (): Promise<Partial<User>[] | null> => {
    const { data, error } = await supabase
      .from('user_table')
      .select('user_id, user_name, email, profile_picture_url, user_type')
      .in('user_type', ['Admin', 'Staff'])
    if (error) {
      console.error('Error fetching staff and admin users:', error)
      return null
    }
    console.log(data)
    return data || null
  }

  const removeAdminOrStaffMember = async (
    email: string,
    userId: string,
    previousRole: 'Staff' | 'Admin'
  ): Promise<boolean> => {
    let currentUser = user

    if (!user) {
      currentUser = await getUser()
      setUser(currentUser)
    }

    const { error } = await supabase
      .from('user_table')
      .update({ user_type: 'User' })
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing admin/staff member:', error)
      return false
    }

    await insertAuditLog({
      user_id: currentUser?.user_id || 'unknown',
      action_type: `remove_${previousRole.toLowerCase()}`,
      target_entity_type: 'user',
      target_entity_id: userId,
      details: {
        action: `Remove ${previousRole}`,
        email: email,
        user_type: 'User'
      }
    })

    return true
  }

  const addStaffMember = async (
    userId: string,
    email: string,
    role: 'Staff' | 'Admin'
  ): Promise<boolean> => {
    try {
      let currentUser = user

      if (!user) {
        currentUser = await getUser()
        setUser(currentUser)
      }

      const { error } = await supabase
        .from('user_table')
        .update({ user_type: role })
        .eq('user_id', userId)
        .eq('user_type', 'User') // Ensure only regular users can be promoted

      if (error) {
        console.error('Error adding staff member:', error)
        return false
      }

      await insertAuditLog({
        user_id: currentUser?.user_id || 'unknown',
        action_type: `Add ${role}`,
        target_entity_type: 'user',
        target_entity_id: userId,
        details: {
          action: `add_${role.toLowerCase()}`,
          email: email,
          user_type: role
        }
      })

      return true
    } catch (error) {
      console.error('Exception adding staff member:', error)
      return false
    }
  }

  return { getAllStaffAndAdmin, removeAdminOrStaffMember, addStaffMember }
}
