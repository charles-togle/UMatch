import Post from '@/features/posts/components/Post'
import { useParams } from 'react-router-dom'
import { getPost } from '@/features/posts/data/posts'
import { useEffect, useState } from 'react'
import PostSkeleton from '@/features/posts/components/PostSkeleton'
import type { PublicPost } from '@/features/posts/types/post'
import Header from '@/shared/components/Header'
import { IonCard, IonCardContent, IonContent } from '@ionic/react'

export default function ExpandedHistoryPost () {
  const { postId } = useParams<{ postId: string }>()
  const [post, setPost] = useState<PublicPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return
      const fetchedPost = await getPost(postId as string)
      setPost(fetchedPost)
      setLoading(false)
    }
    fetchPost()
  }, [postId])

  const getMessage = () => {
    if (!post) return ''
    switch (post.post_status) {
      case 'pending':
        return "Waiting for approval. You'll be notified once reviewed."
      case 'accepted':
        return 'Your post has been accepted.'
      case 'rejected':
        return 'Your post has been rejected.'
      case 'reported':
        return "Under review. As the poster, you're not involved with the report."
      case 'fraud':
        return "Temporarily removed. As the poster, you're not involved. Will be restored after further review."
    }
  }

  const getStatusColor = () => {
    if (!post) return 'gray'
    switch (post.post_status) {
      case 'pending':
        return 'text-amber-500'
      case 'accepted':
        return 'text-green-500'
      case 'rejected':
        return 'text-umak-red'
      case 'reported':
        return 'text-umak-red'
      case 'fraud':
        return 'text-umak-red'
    }
  }

  return (
    <IonContent>
      <Header isProfileAndNotificationShown={true} logoShown={true} />
      <IonCard className='my-4'>
        <IonCardContent>
          <div className='flex flex-col place-items-center text-center'>
            <div className={`text-xl font-bold capitalize ${getStatusColor()}`}>
              {post?.post_status}
            </div>
            <div className='text-base font-medium'>{getMessage()}</div>
          </div>
        </IonCardContent>
      </IonCard>

      {loading ? (
        <PostSkeleton />
      ) : (
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
          className={'min-h-[400px]!'}
        />
      )}
    </IonContent>
  )
}
