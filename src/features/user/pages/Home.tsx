import { notifications, personCircle, add } from 'ionicons/icons'
import {
  useCallback,
  useState,
  useEffect,
  useRef,
  memo,
  type MouseEventHandler
} from 'react'
import CatalogPost from '@/features/user/components/home/CatalogPost'
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonIcon,
  IonButtons,
  IonButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonBadge,
  IonLoading,
  IonFab,
  IonFabButton
} from '@ionic/react'
import { Keyboard } from '@capacitor/keyboard'
import { useNavigation } from '@/shared/hooks/useNavigation'
import Header from '@/shared/components/Header'
import { getCachedImage, cachedFileExists } from '@/shared/utils/fileUtils'
import { listPublicPosts } from '@/features/user/data/posts'
import type { PublicPost } from '@/features/user/types/post'
import HomeSkeleton from '../components/skeletons/HomeSkeleton'

// CatalogHeader Component
const CatalogHeader = memo(
  ({ handleClick }: { handleClick: MouseEventHandler }) => {
    const searchRef = useRef<HTMLIonSearchbarElement>(null)
    const [unreadCount] = useState<number>(3)
    const { navigate } = useNavigation()
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null)
    const handleNotificationClick = useCallback(() => {
      navigate('/user/notifications')
    }, [navigate])
    const profilePicRef = useRef<string | null>(null)
    useEffect(() => {
      const getProfilePicture = async () => {
        if (profilePicRef.current) return
        const exists = await cachedFileExists(
          'profilePicture.jpg',
          'cache/images'
        )
        if (exists) {
          const url = await getCachedImage('profilePicture.jpg', 'cache/images')
          profilePicRef.current = url
          setProfilePicUrl(url)
        }
      }
      getProfilePicture()
    }, [])

    return (
      <Header logoShown={true}>
        <IonSearchbar
          ref={searchRef}
          onClick={handleClick}
          placeholder='Search'
          showClearButton='never'
          style={
            {
              ['--border-radius']: '0.5rem'
            } as React.CSSProperties
          }
        />

        {/* Notification Icon with Badge */}
        <IonButtons slot='end'>
          <IonButton className='relative' onClick={handleNotificationClick}>
            <IonIcon
              icon={notifications}
              slot='icon-only'
              className='text-white text-2xl'
            />
            {unreadCount > 0 && (
              <IonBadge
                color='danger'
                className='absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full'
              >
                {unreadCount}
              </IonBadge>
            )}
          </IonButton>
        </IonButtons>

        {/* Profile Icon */}
        <IonButtons slot='end'>
          <IonButton>
            {profilePicUrl ? (
              <img
                src={profilePicUrl}
                alt='Profile'
                className='w-8 h-8 rounded-full object-cover'
              />
            ) : (
              <IonIcon
                icon={personCircle}
                slot='icon-only'
                className='text-white text-2xl'
              />
            )}
          </IonButton>
        </IonButtons>
      </Header>
    )
  }
)

// Main Catalog Component
export default function Home () {
  const [posts, setPosts] = useState<PublicPost[]>([])
  const [hasMore, _setHasMore] = useState<boolean>(true)
  const [isRefreshingContent, setRefreshingContent] = useState<boolean>(false)
  const contentRef = useRef<HTMLIonContentElement | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const { navigate } = useNavigation()

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const posts = await listPublicPosts()
      setPosts(posts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    const handler = (_ev?: Event) => {
      contentRef.current?.scrollToTop?.(300)
    }

    window.addEventListener('app:scrollToTop', handler as EventListener)
    return () =>
      window.removeEventListener('app:scrollToTop', handler as EventListener)
  }, [])

  // Pull to refresh handler
  const handleRefresh = useCallback((event: CustomEvent) => {
    setRefreshingContent(true)
    fetchPosts()
    setTimeout(() => {
      //fetch new random posts
      event.detail.complete()
      setRefreshingContent(false) // hide loader after reload
    }, 1000)
  }, [])

  const loadMorePosts = async (event: CustomEvent<void>) => {
    const target = event.target as HTMLIonInfiniteScrollElement | null
    if (!target) return
    setTimeout(() => {
      target.complete()
    }, 1000)
  }

  const handleSearchBarClick = () => {
    Keyboard.hide()
    navigate('/user/search')
  }

  const handleAddPost = () => {
    navigate('/user/new-post')
  }
  if (loading) {
    return <HomeSkeleton />
  }
  return (
    <>
      <CatalogHeader handleClick={handleSearchBarClick} />
      <IonContent ref={contentRef} className='ion-padding mb-16'>
        {/* Pull to refresh */}
        <div className='pb-6'>
          <IonRefresher slot='fixed' onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          {/* Dynamic CatalogPosts */}
          <div className='flex flex-col gap-4'>
            {posts.map((post, idx) => (
              <CatalogPost
                key={post.post_id}
                itemName={post.itemname}
                description={`This is a test description for catalog post ${post.post_id}.`}
                lastSeen={post.last_seen_at || ''}
                chips={[
                  { label: post.category || '' },
                  { label: 'sample' },
                  { label: 'test' }
                ]}
                imageUrl={post.item_image_url || ''}
                locationLastSeenAt={post.last_seen_location || ''}
                user_profile_picture_url={
                  post.is_anonymous ? null : post.profilepicture_url
                }
                username={post.is_anonymous ? 'Anonymous' : post.username}
                className={!hasMore && idx === posts.length - 1 ? 'mb-10' : ''}
              />
            ))}
          </div>

          {/* Infinite Scroll */}
          {hasMore && (
            <IonInfiniteScroll threshold='100px' onIonInfinite={loadMorePosts}>
              <div className='pt-5'>
                <IonInfiniteScrollContent
                  loadingSpinner='crescent'
                  loadingText='Loading more posts...'
                />
              </div>
            </IonInfiniteScroll>
          )}
        </div>

        <IonFab
          slot='fixed'
          vertical='bottom'
          horizontal='end'
          className='mb-17 mr-2'
        >
          <IonFabButton
            style={{
              '--background': 'var(--color-umak-blue)'
            }}
            onClick={handleAddPost}
          >
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>

        {/* ✅ Show IonLoading while refreshing */}
        {isRefreshingContent && (
          <IonLoading
            isOpen
            message='Refreshing content...'
            spinner='crescent'
          />
        )}
      </IonContent>
    </>
  )
}
