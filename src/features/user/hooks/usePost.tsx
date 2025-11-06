import { useUser } from '@/features/auth/contexts/UserContext'
import { postServices, type CreatePostInput } from '../services/postServices'
import { useAuditLogs } from '@/shared/hooks/useAuditLogs'
import { supabase } from '@/shared/lib/supabase'

/**
 * Hook to access post services with automatic user context injection.
 * Wraps postServices to provide a cleaner API for components.
 */
export function usePost () {
  const { getUser } = useUser()
  const { insertAuditLog } = useAuditLogs()

  /**
   * Create a new post for the current user
   */
  const createPost = async (postData: CreatePostInput) => {
    const user = await getUser()
    if (!user) {
      return { post: null, error: 'User not authenticated' }
    }
    return await postServices.createPost(user.user_id, postData)
  }

  /**
   * Report a post as fraudulent
   */
  const reportPost = async ({
    postId,
    concern,
    additionalDetails,
    proofImage
  }: {
    postId: string | number
    concern: string
    additionalDetails?: string
    proofImage?: File | null
  }) => {
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const reason = `Reason for reporting: ${concern} ${
      additionalDetails?.trim() !== ''
        ? `\n\n Additional details: ${additionalDetails}`
        : ''
    }`
    return await postServices.reportPost(postId, reason, proofImage)
  }

  /**
   * Accept a post (update post_status to 'accepted')
   */
  const acceptPost = async (postId: string) => {
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
      .from('post_table')
      .update({ accepted_on_date: new Date().toISOString() })
      .eq('post_id', postId)

    if (error) {
      console.error('Error updating accepted_on_date:', error)
      return { success: false, error: error.message }
    }

    const result = await postServices.updatePostStatus(postId, 'accepted')

    if (result.success && data) {
      await insertAuditLog({
        user_id: user.user_id,
        action_type: 'accept_post',
        target_entity_type: 'post',
        target_entity_id: postId,
        details: {
          action: 'Accept Post',
          post_id: postId,
          new_status: 'accepted'
        }
      })
    }

    return result
  }

  /**
   * Reject a post (update post_status to 'rejected')
   */
  const rejectPost = async (postId: string) => {
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const result = await postServices.updatePostStatus(postId, 'rejected')

    if (result.success) {
      await insertAuditLog({
        user_id: user.user_id,
        action_type: 'reject_post',
        target_entity_type: 'post',
        target_entity_id: postId,
        details: {
          action: 'Reject Post',
          post_id: postId,
          new_status: 'rejected'
        }
      })
    }

    return result
  }

  return {
    createPost,
    reportPost,
    acceptPost,
    rejectPost
  }
}
