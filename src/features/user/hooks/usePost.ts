import { useCallback } from 'react'
import { useUser } from '@/features/auth/contexts/UserContext'
import { postServices } from '@/features/user/services/postServices'
import type {
  CreatePostInput,
  UpdatePostInput,
  PostStatus,
  PostCategory
} from '@/features/user/services/postServices'

/**
 * Custom hook for post operations with automatic user authentication
 * Handles business logic and user context integration
 */
export function usePost () {
  const { getUser } = useUser()

  /**
   * Create a new post for the current authenticated user
   * @param postData - The post data to create
   * @returns The created post or error
   */
  const createPost = useCallback(
    async (postData: CreatePostInput) => {
      try {
        const user = await getUser()
        return await postServices.createPost(user.user_id, postData)
      } catch (error) {
        console.error('[usePost] Error creating post:', error)
        return {
          post: null,
          error:
            error instanceof Error ? error.message : 'Failed to create post'
        }
      }
    },
    [getUser]
  )

  /**
   * Get all posts created by the current authenticated user
   * @returns Array of user's posts or error
   */
  const getUserPosts = useCallback(async () => {
    try {
      const user = await getUser()
      return await postServices.getUserPosts(user.user_id)
    } catch (error) {
      console.error('[usePost] Error fetching user posts:', error)
      return {
        posts: null,
        error:
          error instanceof Error ? error.message : 'Failed to fetch user posts'
      }
    }
  }, [getUser])

  /**
   * Update an existing post
   * Note: Consider adding ownership verification in production
   * @param updateData - The post data to update (must include post_id)
   * @returns The updated post or error
   */
  const updatePost = useCallback(
    async (updateData: UpdatePostInput) => {
      try {
        // Ensure user is authenticated before allowing update
        await getUser()

        // TODO: Add ownership verification
        // const post = await postServices.getPost(updateData.post_id)
        // if (post.post?.user_id !== user.user_id) {
        //   return { post: null, error: 'Unauthorized to update this post' }
        // }

        return await postServices.updatePost(updateData)
      } catch (error) {
        console.error('[usePost] Error updating post:', error)
        return {
          post: null,
          error:
            error instanceof Error ? error.message : 'Failed to update post'
        }
      }
    },
    [getUser]
  )

  /**
   * Delete a post
   * Note: Consider adding ownership verification in production
   * @param postId - The ID of the post to delete
   * @returns Success status or error
   */
  const deletePost = useCallback(
    async (postId: string) => {
      try {
        // Ensure user is authenticated before allowing deletion
        await getUser()

        // TODO: Add ownership verification
        // const post = await postServices.getPost(postId)
        // if (post.post?.user_id !== user.user_id) {
        //   return { success: false, error: 'Unauthorized to delete this post' }
        // }

        return await postServices.deletePost(postId)
      } catch (error) {
        console.error('[usePost] Error deleting post:', error)
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Failed to delete post'
        }
      }
    },
    [getUser]
  )

  /**
   * Get a single post by ID
   * No authentication required for viewing
   * @param postId - The ID of the post to retrieve
   * @returns The post or error
   */
  const getPost = useCallback(async (postId: string) => {
    return await postServices.getPost(postId)
  }, [])

  /**
   * Get all posts with optional filters
   * No authentication required for viewing
   * @param filters - Optional filters for posts
   * @returns Array of posts or error
   */
  const getPosts = useCallback(
    async (filters?: {
      status?: PostStatus
      category?: PostCategory
      userId?: string
      limit?: number
      offset?: number
    }) => {
      return await postServices.getPosts(filters)
    },
    []
  )

  /**
   * Search posts by item name or description
   * No authentication required for searching
   * @param searchTerm - The search term
   * @param filters - Optional additional filters
   * @returns Array of matching posts or error
   */
  const searchPosts = useCallback(
    async (
      searchTerm: string,
      filters?: {
        status?: PostStatus
        category?: PostCategory
        limit?: number
      }
    ) => {
      return await postServices.searchPosts(searchTerm, filters)
    },
    []
  )

  return {
    // Operations requiring authentication
    createPost,
    getUserPosts,
    updatePost,
    deletePost,

    // Public operations (no auth required)
    getPost,
    getPosts,
    searchPosts
  }
}
