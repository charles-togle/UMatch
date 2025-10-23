import type { PublicPost } from '@/features/user/types/post'
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
import {
  createPostCache,
  type PostCacheKeys
} from '@/features/user/data/postsCache'
import { useNavigation } from '@/shared/hooks/useNavigation'

export default function PostList ({
  posts,
  children,
  ref,
  fetchPosts,
  hasMore,
  setPosts,
  loadedIdsRef,
  loadMorePosts,
  ionFabButton,
  cacheKeys,
  sortDirection = 'desc'
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
    const cache = createPostCache(cacheKeys)
    const bootstrap = async () => {
      setLoading(true)
      try {
        const [cached, loadedIds] = await Promise.all([
          cache.loadCachedPublicPosts(),
          cache.loadLoadedPostIds()
        ])
        const currPosts = cached.sort((a, b) => {
          if (!a.submission_date && !b.submission_date) return 0
          if (!a.submission_date) return 1
          if (!b.submission_date) return -1
          return sortDirection === 'desc'
            ? (b.submission_date as string).localeCompare(
                a.submission_date as string
              )
            : (a.submission_date as string).localeCompare(
                b.submission_date as string
              )
        })
        if (cached && cached.length > 0) setPosts(currPosts)
        loadedIdsRef.current = loadedIds
        await fetchPosts()
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
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
