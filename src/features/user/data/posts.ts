import { supabase } from '@/shared/lib/supabase'
import type { PublicPost } from '@/features/user/types/post'

const fmtManila = (iso: string | null) => {
  if (!iso) return null
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(new Date(iso))
}

export async function getTotalPostsCount (): Promise<number | null> {
  const { count, error } = await supabase
    .from('post_public_view')
    .select('*', { count: 'exact', head: true })
  if (error) {
    console.error('Error fetching post count')
    return null
  }
  return count
}

export async function listOwnPosts ({
  excludeIds = [],
  userId,
  limit
}: {
  excludeIds: string[]
  userId: string
  limit: number
}): Promise<{ posts: PublicPost[]; count: number | null }> {
  let query = supabase
    .from('post_public_view')
    .select(
      `
      post_id,
      poster_name,
      poster_id,
      item_name,
      profile_picture_url,
      item_image_url,
      item_description,
      category,
      last_seen_at,
      item_status,
      last_seen_location,
      is_anonymous,
      submission_date,
      item_type,
      post_status
    `
    )
    .eq('poster_id', userId)

  let { count: totalCount, error: countError } = await supabase
    .from('post_public_view')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('Error fetching post count for user posts')
    totalCount = 0
  }
  if (excludeIds && excludeIds.length > 0) {
    const inList = `(${excludeIds.map(id => `${id}`).join(',')})`
    query = query.not('post_id', 'in', inList)
  }

  const { data, error } = await query.limit(limit)

  if (error) throw error

  return {
    posts: (data ?? []).map((r: any) => ({
      user_id: r.poster_id,
      username: r.poster_name,
      item_name: r.item_name,
      profilepicture_url: r.profile_picture_url,
      item_image_url: r.item_image_url,
      item_description: r.item_description,
      item_status: r.item_status,
      category: r.category,
      last_seen_at: fmtManila(r.last_seen_at),
      last_seen_location: r.last_seen_location,
      is_anonymous: r.is_anonymous,
      post_id: r.post_id,
      submission_date: r.submission_date,
      item_type: r.item_type,
      post_status: r.post_status
    })),
    count: totalCount
  }
}

export async function listPublicPosts (
  excludeIds: string[] = [],
  limit: number = 5
): Promise<PublicPost[]> {
  let query = supabase
    .from('post_public_view')
    .select(
      `
      post_id,
      poster_name,
      poster_id,
      item_name,
      profile_picture_url,
      item_image_url,
      item_description,
      category,
      last_seen_at,
      item_status,
      last_seen_location,
      is_anonymous,
      submission_date,
      item_type,
      post_status
    `
    )
    .eq('item_type', 'found')

  if (excludeIds && excludeIds.length > 0) {
    // Use single-quoted string literals for UUIDs in the IN list
    const inList = `(${excludeIds.map(id => `${id}`).join(',')})`
    query = query.not('post_id', 'in', inList)
  }

  const { data, error } = await query.limit(limit)

  if (error) throw error

  return (data ?? []).map((r: any) => ({
    user_id: r.poster_id,
    username: r.poster_name,
    item_name: r.item_name,
    profilepicture_url: r.profile_picture_url,
    item_image_url: r.item_image_url,
    item_description: r.item_description,
    item_status: r.item_status,
    category: r.category,
    last_seen_at: fmtManila(r.last_seen_at),
    last_seen_location: r.last_seen_location,
    is_anonymous: r.is_anonymous,
    post_id: r.post_id,
    submission_date: r.submission_date,
    item_type: r.item_type,
    post_status: r.post_status
  }))
}
