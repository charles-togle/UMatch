import type { PublicPost } from '@/features/posts/types/post'
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonLoading,
  IonActionSheet
} from '@ionic/react'
import { useState, useEffect } from 'react'
import CatalogPost from '@/features/user/components/home/CatalogPost'
import { useCallback } from 'react'
import { type PostCacheKeys } from '@/features/posts/data/postsCache'
import { useNavigation } from '@/shared/hooks/useNavigation'

export default function PostList ({
  posts,
  children,
  ref,
  fetchPosts,
  hasMore,
  loadMorePosts,
  ionFabButton,
  onClick
}: {
  ref?: React.RefObject<HTMLIonContentElement | null>
  posts: PublicPost[]
  children?: React.ReactNode
  fetchPosts: () => Promise<void>
  hasMore: boolean
  setPosts: React.Dispatch<React.SetStateAction<PublicPost[]>>
  loadedIdsRef: React.RefObject<Set<string>>
  loadMorePosts: (event: CustomEvent<void>) => Promise<void>
  ionFabButton?: React.ReactNode
  cacheKeys?: Partial<PostCacheKeys>
  sortDirection?: 'asc' | 'desc'
  pageSize: number
  onClick?: (postId: string) => void | undefined
}) {
  const [isRefreshingContent, setRefreshingContent] = useState<boolean>(false)
  const [showActions, setShowActions] = useState(false)
  const [activePostId, setActivePostId] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const { navigate } = useNavigation()
  const handleActionSheetClick = (postId: string) => {
    console.log('Handling action sheet click for post ID:', postId)
    setActivePostId(postId)
    setShowActions(true)
  }

  useEffect(() => {
    const loadInitialPosts = async () => {
      setLoading(true)
      await fetchPosts()
      setLoading(false)
    }
    loadInitialPosts()
  }, [])

  const handleRefresh = useCallback((event: CustomEvent) => {
    setRefreshingContent(true)
    ;(async () => {
      await fetchPosts()
      event.detail.complete()
      setRefreshingContent(false)
    })()
  }, [])

  return (
    <IonContent ref={ref} className='mb-16 bg-default-bg'>
      <div className='pb-6'>
        <IonRefresher slot='fixed' onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {children}

        {loading ? (
          <div className='flex flex-col gap-4 animate-pulse'>
            {[...Array(2)].map((_, index) => (
              <CatalogPost
                description='...'
                itemName='...'
                lastSeen='...'
                key={index}
              />
            ))}
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {posts.map((post, idx) => (
              <CatalogPost
                key={post.post_id}
                itemName={post.item_name}
                description={post.item_description || ''}
                lastSeen={post.last_seen_at || ''}
                imageUrl={post.item_image_url || ''}
                locationLastSeenAt={post.last_seen_location || ''}
                user_profile_picture_url={
                  post.is_anonymous ? null : post.profilepicture_url
                }
                username={post.is_anonymous ? 'Anonymous' : post.username}
                className={!hasMore && idx === posts.length - 1 ? '' : ''}
                onActionSheetClick={() => handleActionSheetClick(post.post_id)}
                itemStatus={post.item_status}
                onClick={() => onClick?.(post.post_id)}
                postId={post.post_id}
              />
            ))}
          </div>
        )}

        {hasMore ? (
          <IonInfiniteScroll threshold='100px' onIonInfinite={loadMorePosts}>
            <div className='pt-5'>
              <IonInfiniteScrollContent
                loadingSpinner='crescent'
                loadingText='Loading more posts...'
              />
            </div>
          </IonInfiniteScroll>
        ) : (
          <p className='mb-10 h-15 flex justify-center items-center text-gray-400'>
            You're all caught up
          </p>
        )}
      </div>

      {isRefreshingContent && (
        <IonLoading isOpen message='Refreshing content...' spinner='crescent' />
      )}

      {ionFabButton}

      <IonActionSheet
        isOpen={showActions}
        onDidDismiss={() => setShowActions(false)}
        header='Post actions'
        buttons={[
          {
            text: 'View details',
            handler: () => {
              if (activePostId) navigate(`/user/post/${activePostId}`)
            }
          },
          {
            text: 'Share',
            handler: async () => {
              try {
                if (!activePostId) return
                await navigator.clipboard.writeText(
                  `${window.location.origin}/user/post/${activePostId}`
                )
              } catch (e) {
                console.warn('Share copy failed', e)
              }
            }
          },
          {
            text: 'Report',
            role: 'destructive',
            handler: () => {
              if (activePostId) navigate(`/user/report/${activePostId}`)
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]}
      />
    </IonContent>
  )
}
