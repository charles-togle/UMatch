import { useUser } from '@/features/auth/contexts/UserContext'
import { postServices, type CreatePostInput } from '../services/postServices'

/**
 * Hook to access post services with automatic user context injection.
 * Wraps postServices to provide a cleaner API for components.
 */
export function usePost () {
  const { getUser } = useUser()

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

  return {
    createPost,
    reportPost
  }
}
