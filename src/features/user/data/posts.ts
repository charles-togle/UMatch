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

export async function listPublicPosts (): Promise<PublicPost[]> {
  const { data, error } = await supabase
    .from('post_public_view')
    .select(
      `
      post_id,
      poster_name,
      item_name,
      profile_picture_url,
      item_image_url,
      category,
      last_seen_at,
      last_seen_location,
      is_anonymous
    `
    )
    .eq('item_type', 'found')
    .order('last_seen_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((r: any) => ({
    username: r.poster_name,
    itemname: r.item_name,
    profilepicture_url: r.profile_picture_url,
    item_image_url: r.item_image_url,
    category: r.category,
    last_seen_at: fmtManila(r.last_seen_at),
    last_seen_location: r.last_seen_location,
    is_anonymous: r.is_anonymous,
    post_id: r.post_id
  }))
}
