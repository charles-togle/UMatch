import { supabase } from '@/shared/lib/supabase'
import { computeBlockHash64 } from '@/shared/utils/hashUtils'
import { makeDisplay } from '@/shared/utils/imageUtils'
import { uploadAndGetPublicUrl } from '@/shared/utils/supabaseStorageUtils'

// Post type enum
export type PostType = 'lost' | 'found'
export type PostCategory =
  | 'Electronics'
  | 'Accessories'
  | 'Documents'
  | 'Clothing'
  | 'Keys'
  | 'Other'

// Post interface matching Supabase schema
export interface Post {
  post_id: string
  user_id: string
  item_name: string
  description: string | null
  category: PostCategory
  type: PostType
  location_last_seen: string | null
  date_last_seen: string | null
  image_urls: string[] | null
  created_at: string
  updated_at: string
}

// Create Post input type (omit auto-generated fields)
export interface CreatePostInput {
  anonymous: boolean
  item: {
    title: string
    desc: string
    type: PostType
  }
  // Required: selected category from UI
  category: PostCategory
  lastSeenISO: string
  locationDetails: {
    level1: string
    level2: string
    level3: string
  }
  imageName: string
  image: File
}

// Update Post input type (all fields optional except post_id)
export interface UpdatePostInput {
  post_id: string
  item_name?: string
  description?: string
  category?: PostCategory
  type?: PostType
  location_last_seen?: string
  date_last_seen?: string
  image_urls?: string[]
}

// Response types
interface PostResponse {
  post: Post | null
  error: string | null
}

// interface PostsResponse {
//   posts: Post[] | null
//   error: string | null
// }

export const postServices = {
  /**
   * Create a new post
   * @param userId - The ID of the user creating the post
   * @param postData - The post data to create
   * @returns The created post or error
   */
  createPost: async (
    userId: string,
    postData: CreatePostInput
  ): Promise<PostResponse> => {
    try {
      console.log('[postServices] Creating post:', postData)

      // 1) Compress
      const displayBlob = await makeDisplay(postData.image)

      // 2) Paths
      const basePath = `posts/${userId}/${Date.now()}`
      const displayPath = `${basePath}.webp`

      const displayUrl = await uploadAndGetPublicUrl(
        displayPath,
        displayBlob,
        'image/webp'
      )

      // Parse lastSeenISO to extract date and time
      const lastSeenDate = new Date() // local device time
      const lastSeenHours = lastSeenDate.getHours() // 0–23 (local)
      const lastSeenMinutes = lastSeenDate.getMinutes() // 0–59

      // Build location path array
      const locationPath: Array<{
        name: string
        type: 'level1' | 'level2' | 'level3'
      }> = []

      const level1 = postData.locationDetails.level1?.trim()
      if (level1) {
        locationPath.push({ name: level1, type: 'level1' })
      }

      const level2 = postData.locationDetails.level2?.trim()
      if (level2 && level2 !== 'Not Applicable') {
        locationPath.push({ name: level2, type: 'level2' })
      }

      const level3 = postData.locationDetails.level3?.trim()
      if (level3 && level3 !== 'Not Applicable') {
        // Use 'Room' for all room types
        locationPath.push({ name: level3, type: 'level3' })
      }
      const imageHash = await computeBlockHash64(postData.image)

      const { data, error } = await supabase.rpc(
        'create_post_with_item_date_time_location',
        {
          p_poster_id: userId,
          p_item_name: postData.item.title,
          p_item_description: postData.item.desc,
          p_item_type: postData.item.type,
          p_image_hash: imageHash,
          p_image_link: displayUrl,
          p_last_seen_date: lastSeenDate,
          p_last_seen_hours: lastSeenHours,
          p_last_seen_minutes: lastSeenMinutes,
          p_location_path: locationPath,
          p_item_status: 'unclaimed',
          p_category: postData.category,
          p_post_status: 'pending',
          p_is_anonymous: postData.anonymous
        }
      )

      if (error) {
        console.error('[postServices] Error creating post:', error)
        return { post: null, error: error.message }
      }

      console.log('[postServices] Post created successfully:', data)
      return { post: data as Post, error: null }
    } catch (error) {
      console.error('[postServices] Exception creating post:', error)
      return { post: null, error: 'Failed to create post' }
    }
  }

  /**
   * Get a single post by ID
   * @param postId - The ID of the post to retrieve
   * @returns The post or error
   */
  // getPost: async (postId: string): Promise<PostResponse> => {
  //   // TODO: Implement
  //   throw new Error('Not implemented')
  // },

  /**
   * Get all posts with optional filters
   * @param filters - Optional filters for posts (type, category, userId)
   * @returns Array of posts or error
   */
  // getPosts: async (filters?: {
  //   type?: PostType
  //   category?: PostCategory
  //   userId?: string
  //   limit?: number
  //   offset?: number
  // }): Promise<PostsResponse> => {
  //   // TODO: Implement
  //   throw new Error('Not implemented')
  // },

  /**
   * Update an existing post
   * @param updateData - The post data to update (must include post_id)
   * @returns The updated post or error
   */
  // updatePost: async (updateData: UpdatePostInput): Promise<PostResponse> => {
  //   // TODO: Implement
  //   throw new Error('Not implemented')
  // },

  /**
   * Delete a post by ID
   * @param postId - The ID of the post to delete
   * @returns Success type or error
   */
  // deletePost: async (
  //   postId: string
  // ): Promise<{ success: boolean; error: string | null }> => {
  //   // TODO: Implement
  //   throw new Error('Not implemented')
  // },

  /**
   * Get posts by user ID
   * @param userId - The ID of the user
   * @returns Array of user's posts or error
   */
  // getUserPosts: async (userId: string): Promise<PostsResponse> => {
  //   // TODO: Implement
  //   throw new Error('Not implemented')
  // },

  /**
   * Search posts by item name or description
   * @param searchTerm - The search term
   * @param filters - Optional additional filters
   * @returns Array of matching posts or error
   */
  // searchPosts: async (
  //   searchTerm: string,
  //   filters?: {
  //     type?: PostType
  //     category?: PostCategory
  //     limit?: number
  //   }
  // ): Promise<PostsResponse> => {
  //   // TODO: Implement
  //   throw new Error('Not implemented')
  // }
}
