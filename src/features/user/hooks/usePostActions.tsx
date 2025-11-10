import { useUser } from '@/features/auth/contexts/UserContext'
import { postServices, type CreatePostInput } from '../services/postServices'
import { useAuditLogs } from '@/shared/hooks/useAuditLogs'
import { supabase } from '@/shared/lib/supabase'
import useNotifications from './useNotifications'

/**
 * Hook to access post services with automatic user context injection.
 * Wraps postServices to provide a cleaner API for components.
 */
export function usePostActions () {
  const { getUser } = useUser()
  const { insertAuditLog } = useAuditLogs()
  const { sendNotification } = useNotifications()

  /**
   * Create a new post for the current user
   */
  const createPost = async (postData: CreatePostInput) => {
    const user = await getUser()
    if (!user) {
      return { post: null, error: 'User not authenticated' }
    }

    const result = await postServices.createPost(user.user_id, postData)

    if (result.post && !result.error) {
      sendNotification({
        title: 'Report Received',
        message: `We've received your ${postData.item.type} report for "${postData.item.title}" and we'll be reviewing it shortly.`,
        type: 'info',
        userId: user.user_id,
        data: {
          postId: result.post.post_id,
          link: `/user/history/view/${result.post.post_id}`
        }
      })
    }

    return result
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

  const acceptPost = async (postId: string, itemName: string) => {
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    const { data: postData, error: postError } = await supabase
      .from('post_table')
      .select('item_id, status')
      .eq('post_id', postId)
      .single()

    if (postError) {
      console.error('Error fetching post data:', postError)
      return { success: false, error: postError.message }
    }
    const oldStatus = postData?.status

    // Update accepted_on_date
    const { error: updateError } = await supabase
      .from('post_table')
      .update({ accepted_on_date: new Date().toISOString() })
      .eq('post_id', postId)

    if (updateError) {
      console.error('Error updating accepted_on_date:', updateError)
      return { success: false, error: updateError.message }
    }

    const result = await postServices.updatePostStatus(postId, 'accepted')

    if (result.success) {
      sendNotification({
        title: 'Post Accepted',
        message: `Your post about "${itemName}" has been accepted and is now live on the platform.`,
        type: 'success',
        userId: user.user_id,
        data: {
          postId: String(postId),
          link: String(`/user/history/view/${postId}`)
        }
      })

      // Create audit log with correct structure
      await insertAuditLog({
        user_id: user.user_id,
        action_type: 'post_status_updated',
        target_entity_type: 'post',
        target_entity_id: postId,
        details: {
          message: `${user.user_name} set the status of ${itemName} as Accepted`,
          post_title: itemName,
          old_status: oldStatus,
          new_status: 'accepted'
        }
      })
    }

    return result
  }

  /**
   * Reject a post (update status to 'rejected')
   */
  const rejectPost = async (postId: string, itemName: string) => {
    const user = await getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Fetch post and item details before update
    const { data: postData, error: postError } = await supabase
      .from('post_table')
      .select('item_id, status')
      .eq('post_id', postId)
      .single()

    if (postError) {
      console.error('Error fetching post data:', postError)
      return { success: false, error: postError.message }
    }

    const oldStatus = postData?.status

    const result = await postServices.updatePostStatus(postId, 'rejected')

    if (result.success) {
      sendNotification({
        title: 'Post Rejected',
        message: `Your post about "${itemName}" has been rejected and will not be published on the platform.`,
        type: 'error',
        userId: user.user_id,
        data: {
          postId: String(postId),
          link: String(`/user/history/view/${postId}`)
        }
      })

      // Create audit log with correct structure
      await insertAuditLog({
        user_id: user.user_id,
        action_type: 'post_status_updated',
        target_entity_type: 'post',
        target_entity_id: postId,
        details: {
          message: `${user.user_name} set the status of ${itemName} as Rejected`,
          post_title: itemName,
          old_status: oldStatus,
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
