import { supabase } from '@/shared/lib/supabase'
import type { User } from '@/features/auth/contexts/UserContext'

export function useAdminServices () {
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

  const removeAdminOrStaffMember = async (userId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('user_table')
      .update({ user_type: 'User' })
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing admin/staff member:', error)
      return false
    }

    return true
  }

  const addStaffMember = async (
    userId: string,
    role: 'Staff' | 'Admin'
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_table')
        .update({ user_type: role })
        .eq('user_id', userId)
        .eq('user_type', 'User') // Ensure only regular users can be promoted

      if (error) {
        console.error('Error adding staff member:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Exception adding staff member:', error)
      return false
    }
  }

  return { getAllStaffAndAdmin, removeAdminOrStaffMember, addStaffMember }
}
