import { add } from 'ionicons/icons'
import {
  useState,
  useEffect,
  useRef,
  memo,
  type MouseEventHandler
} from 'react'
import { IonSearchbar, IonIcon, IonFab, IonFabButton } from '@ionic/react'
import { Keyboard } from '@capacitor/keyboard'
import { useNavigation } from '@/shared/hooks/useNavigation'
import Header from '@/shared/components/Header'
import { listPublicPosts } from '@/features/user/data/posts'
import { createPostCache } from '@/features/user/data/postsCache'
import type { PublicPost } from '@/features/user/types/post'
import { getTotalPostsCount } from '@/features/user/data/posts'
import PostList from '@/shared/components/PostList'
import { Network } from '@capacitor/network'

// CatalogHeader Component
const CatalogHeader = memo(
  ({ handleClick }: { handleClick: MouseEventHandler }) => {
    const searchRef = useRef<HTMLIonSearchbarElement>(null)
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
      </Header>
    )
  }
)

// Main Catalog Component
export default function Home () {
  const PAGE_SIZE = 5
  const SORT_DIR: 'asc' | 'desc' = 'desc'
  const [posts, setPosts] = useState<PublicPost[]>([])
  const [hasMore, setHasMore] = useState<boolean>(true)
  const contentRef = useRef<HTMLIonContentElement | null>(null)
  const { navigate } = useNavigation()
  const loadedIdsRef = useRef<Set<string>>(new Set())
  const homeCacheRef = useRef(
    createPostCache({
      loadedKey: 'LoadedPosts:home',
      cacheKey: 'CachedPublicPosts:home'
    })
  )

  const fetchPosts = async (): Promise<void> => {
    try {
      let cachedPosts = await homeCacheRef.current.loadCachedPublicPosts()
      if (cachedPosts.length > 0 && posts.length === 0) {
        cachedPosts = cachedPosts.sort((a, b) => {
          if (!a.submission_date && !b.submission_date) return 0
          if (!a.submission_date) return 1
          if (!b.submission_date) return -1
          return SORT_DIR === 'desc'
            ? (b.submission_date as string).localeCompare(
                a.submission_date as string
              )
            : (a.submission_date as string).localeCompare(
                b.submission_date as string
              )
        })
        cachedPosts.forEach(p => loadedIdsRef.current.add(p.post_id))
        setPosts(cachedPosts)
      }

      if ((await Network.getStatus()).connected === false) {
        return
      }

      const exclude = Array.from(loadedIdsRef.current)
      const newPosts = await listPublicPosts(exclude, PAGE_SIZE)
      if (newPosts.length === 0) {
        setHasMore(false)
        homeCacheRef.current.loadCachedPublicPosts().then(cachedPosts => {
          setPosts(
            cachedPosts.sort((a, b) => {
              if (!a.submission_date && !b.submission_date) return 0
              if (!a.submission_date) return 1
              if (!b.submission_date) return -1
              return SORT_DIR === 'desc'
                ? (b.submission_date as string).localeCompare(
                    a.submission_date as string
                  )
                : (a.submission_date as string).localeCompare(
                    b.submission_date as string
                  )
            })
          )
        })
        return
      }

      const newIds = new Set(newPosts.map(np => np.post_id))
      const filteredPrev = posts.filter(p => !newIds.has(p.post_id))
      const merged = [...newPosts, ...filteredPrev].sort((a, b) => {
        if (!a.submission_date && !b.submission_date) return 0
        if (!a.submission_date) return 1
        if (!b.submission_date) return -1
        return SORT_DIR === 'desc'
          ? (b.submission_date as string).localeCompare(
              a.submission_date as string
            )
          : (a.submission_date as string).localeCompare(
              b.submission_date as string
            )
      })
      newPosts.forEach(p => loadedIdsRef.current.add(p.post_id))
      await homeCacheRef.current.saveLoadedPostIds(loadedIdsRef.current)
      await homeCacheRef.current.addPostsToCache(newPosts)
      const totalPostsCount = await getTotalPostsCount()
      const hasMorePosts: boolean = merged.length !== totalPostsCount
      setHasMore(hasMorePosts)
      if (hasMorePosts) {
        setPosts(merged)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  useEffect(() => {
    const handler = (_ev?: Event) => {
      contentRef.current?.scrollToTop?.(300)
    }

    window.addEventListener('app:scrollToTop', handler as EventListener)
    return () =>
      window.removeEventListener('app:scrollToTop', handler as EventListener)
  }, [])

  const loadMorePosts = async (event: CustomEvent<void>) => {
    console.log(hasMore)
    const target = event.target as HTMLIonInfiniteScrollElement | null
    if (!target) return
    await fetchPosts()
    target.complete()
  }

  const handleSearchBarClick = () => {
    Keyboard.hide()
    navigate('/user/search')
  }

  const handleAddPost = () => {
    navigate('/user/new-post')
  }

  return (
    <>
      <CatalogHeader handleClick={handleSearchBarClick} />
      <PostList
        posts={posts}
        fetchPosts={fetchPosts}
        hasMore={hasMore}
        setPosts={setPosts}
        loadedIdsRef={loadedIdsRef}
        loadMorePosts={loadMorePosts}
        ref={contentRef}
        sortDirection={SORT_DIR}
        cacheKeys={{
          loadedKey: 'LoadedPosts:home',
          cacheKey: 'CachedPublicPosts:home'
        }}
        pageSize={PAGE_SIZE}
        ionFabButton={
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
        }
      ></PostList>
    </>
  )
}
