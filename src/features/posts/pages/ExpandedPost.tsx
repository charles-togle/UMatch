import { useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { createPostCache } from '@/features/posts/data/postsCache'
import type { PublicPost } from '@/features/posts/types/post'
import { getPost } from '../data/posts'
import Post from '@/features/posts/components/Post'
import Header from '@/shared/components/Header'
import { IonContent } from '@ionic/react'

export default function ExpandedPost () {
  const { postId } = useParams<{ postId: string }>()
  const [post, setPost] = useState<PublicPost | null>()
  const [loading, setLoading] = useState<Boolean>(true)
  const postCache = useRef(
    createPostCache({
      loadedKey: 'LoadedPosts',
      cacheKey: 'CachedPublicPosts'
    })
  )
  useEffect(() => {
    const getCurrentPost = async () => {
      if (!postId) return
      setLoading(true)
      setPost(undefined)

      let cachedPosts = await postCache.current.loadCachedPublicPosts()
      let currPost = cachedPosts.find(p => p.post_id === postId) || null
      if (currPost) {
        setPost(currPost)
        setLoading(false)
        return
      }
      const fetchedPost = await getPost(postId as string)
      setPost(fetchedPost)
      setLoading(false)
    }
    getCurrentPost()
  }, [postId])

  if (loading) {
    return <div>Loading...</div>
  }
  if (!loading && post === null) {
    return <div>No post found.</div>
  }

  return (
    <IonContent>
      <Header isProfileAndNotificationShown={true} logoShown={true} />
      <Post
        category={post?.category ?? ''}
        description={post?.item_description ?? ''}
        imageUrl={post?.item_image_url ?? ''}
        itemName={post?.is_anonymous ? 'Anonymous' : post?.item_name ?? ''}
        itemStatus={post?.item_status ?? ''}
        lastSeen={post?.last_seen_at ?? ''}
        locationLastSeenAt={post?.last_seen_location ?? ''}
        user_profile_picture_url={post?.profilepicture_url ?? ''}
        username={post?.username ?? ''}
      />
    </IonContent>
  )
}
