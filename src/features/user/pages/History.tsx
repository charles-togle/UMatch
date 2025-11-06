import {
  IonContent,
  IonIcon,
  IonLabel,
  IonModal,
  IonChip,
  IonCard,
  IonCardContent,
  IonButton
} from '@ionic/react'
import {
  funnelOutline,
  timeOutline,
  documentTextOutline,
  createOutline
} from 'ionicons/icons'
import UserCard from '@/shared/components/UserCard'
import Header from '@/shared/components/Header'
import PostList from '@/shared/components/PostList'
import { useEffect, useRef, useState } from 'react'
import { listOwnPosts } from '@/features/posts/data/posts'
import { createPostCache } from '@/features/posts/data/postsCache'
import type { PublicPost } from '@/features/posts/types/post'
import { useUser } from '@/features/auth/contexts/UserContext'
import { Network } from '@capacitor/network'

// Status filter types
type PostStatus =
  | 'All'
  | 'Missing'
  | 'Found'
  | 'Claimed'
  | 'Pending'
  | 'Fraud'
  | 'Declined'
  | 'Unclaimed'
const ALL_FILTERS: PostStatus[] = [
  'All',
  'Missing',
  'Found',
  'Claimed',
  'Pending',
  'Fraud',
  'Declined',
  'Unclaimed'
]
const STATUS_MAP: Record<Exclude<PostStatus, 'All'>, string> = {
  Missing: 'missing',
  Found: 'found',
  Claimed: 'claimed',
  Pending: 'pending',
  Fraud: 'fraud',
  Declined: 'declined',
  Unclaimed: 'unclaimed'
}
type SortDirection = 'asc' | 'desc'

export default function History () {
  const PAGE_SIZE = 5
  const loadedIdsRef = useRef<Set<string>>(new Set())
  const [posts, setPosts] = useState<PublicPost[]>([])
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [allPosts, setAllPosts] = useState<PublicPost[]>([])
  const { getUser } = useUser()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Set<PostStatus>>(
    new Set(['All'])
  )
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const contentRef = useRef<HTMLIonContentElement | null>(null)
  const isFetchingRef = useRef<boolean>(false)
  const historyCacheRef = useRef(
    createPostCache({
      loadedKey: 'LoadedPosts:history',
      cacheKey: 'CachedPublicPosts:history'
    })
  )

  useEffect(() => {
    console.log(allPosts)
  }, [allPosts])

  useEffect(() => {
    setPosts(applySort(applyFilter(allPosts)))
  }, [activeFilters, sortDir, allPosts])

  useEffect(() => {
    const handler = (_ev?: Event) => {
      contentRef.current?.scrollToTop?.(300)
    }

    window.addEventListener('app:scrollToTop', handler as EventListener)
    return () =>
      window.removeEventListener('app:scrollToTop', handler as EventListener)
  }, [])

  const applyFilter = (items: PublicPost[]): PublicPost[] => {
    if (activeFilters.has('All')) return items

    // Convert filters to expected values
    const expectedValues = Array.from(activeFilters)
      .filter(f => f !== 'All')
      .map(f => STATUS_MAP[f as Exclude<PostStatus, 'All'>].toLowerCase())

    // Filter items that match ALL selected filters (AND logic)
    return items.filter(post => {
      const postStatus = (post.post_status || '').toLowerCase()
      const itemStatus = (post.item_status || '').toLowerCase()
      const itemType = (post.item_type || '').toLowerCase()

      // Check if the post matches ALL active filters
      return expectedValues.every(expectedValue => {
        return (
          postStatus === expectedValue ||
          itemStatus === expectedValue ||
          itemType === expectedValue
        )
      })
    })
  }

  const applySort = (items: PublicPost[]): PublicPost[] => {
    return [...items].sort((a, b) => {
      const as = a.submission_date || ''
      const bs = b.submission_date || ''
      if (!as && !bs) return 0
      if (!as) return 1
      if (!bs) return -1
      return sortDir === 'desc'
        ? (bs as string).localeCompare(as as string)
        : (as as string).localeCompare(bs as string)
    })
  }

  const fetchPosts = async (): Promise<void> => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      const cachedPosts = await historyCacheRef.current.loadCachedPublicPosts()
      if (cachedPosts.length > 0 && posts.length === 0) {
        setAllPosts(applySort(applyFilter(cachedPosts)))
        cachedPosts.forEach(p => loadedIdsRef.current.add(p.post_id))
      }

      if ((await Network.getStatus()).connected === false) {
        return
      }

      const currentUser = await getUser()
      const userID = currentUser?.user_id
      if (!userID) return

      const exclude = Array.from(loadedIdsRef.current)
      const { posts: newPosts, count: totalPostsCount } = await listOwnPosts({
        userId: userID,
        excludeIds: exclude,
        limit: PAGE_SIZE
      })

      if (newPosts.length === 0) {
        setHasMore(false)
        historyCacheRef.current.loadCachedPublicPosts().then(cachedPosts => {
          setAllPosts(cachedPosts)
        })
        return
      }

      const userOnly = newPosts.filter(p => p.user_id === userID)
      const existingLoaded = new Set(loadedIdsRef.current)
      const newlyUncached = userOnly.filter(p => !existingLoaded.has(p.post_id))
      const newIds = new Set(userOnly.map(np => np.post_id))
      const filteredPrev = allPosts.filter(p => !newIds.has(p.post_id))
      const mergedAll = [...userOnly, ...filteredPrev]
      if (newlyUncached.length > 0) {
        await historyCacheRef.current.addPostsToCache(newlyUncached)
      }
      newlyUncached.forEach(p => loadedIdsRef.current.add(p.post_id))
      await historyCacheRef.current.saveLoadedPostIds(loadedIdsRef.current)
      const hasMorePosts: boolean = mergedAll.length !== totalPostsCount
      if (!hasMorePosts) {
        return
      }
      setAllPosts(mergedAll)
      setHasMore(hasMorePosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      isFetchingRef.current = false
    }
  }

  const loadMorePosts = async (event: CustomEvent<void>) => {
    const target = event.target as HTMLIonInfiniteScrollElement | null
    if (!target) return
    if (!hasMore) {
      target.disabled = true
      target.complete()
      return
    }
    await fetchPosts()
    target.complete()
  }

  // UI bits
  const FilterChip = ({ label }: { label: PostStatus }) => {
    const isActive = activeFilters.has(label)

    const handleClick = () => {
      if (label === 'All') {
        setActiveFilters(new Set(['All']))
      } else {
        const newFilters = new Set(activeFilters)
        newFilters.delete('All')

        if (isActive) {
          newFilters.delete(label)
          if (newFilters.size === 0) {
            newFilters.add('All')
          }
        } else {
          newFilters.add(label)
        }

        setActiveFilters(newFilters)
      }
    }

    return (
      <IonChip
        onClick={handleClick}
        outline={!isActive}
        className='m-1 px-4'
        style={{
          '--background': isActive ? 'var(--color-umak-blue)' : 'transparent',
          '--color': isActive ? 'white' : 'var(--color-umak-blue)',
          border: '2px solid var(--color-umak-blue)'
        }}
      >
        <IonLabel>{label}</IonLabel>
      </IonChip>
    )
  }

  // Removed 'Recently Updated' option; only submission date sorting remains

  return (
    <>
      <Header logoShown={true} isProfileAndNotificationShown={true} />
      <IonContent>
        <PostList
          posts={posts}
          fetchPosts={fetchPosts}
          hasMore={hasMore}
          setPosts={setPosts}
          loadMorePosts={loadMorePosts}
          loadedIdsRef={loadedIdsRef}
          sortDirection={sortDir}
          cacheKeys={{
            loadedKey: 'LoadedPosts:history',
            cacheKey: 'CachedPublicPosts:history'
          }}
          pageSize={PAGE_SIZE}
        >
          <UserCard className='mb-3' />

          {/* Top action row */}
          <IonCard className='px-4 mb-3'>
            <IonCardContent className='flex items-center justify-between gap-3'>
              <div className='flex items-center mb-2 gap-2 text-umak-blue'>
                <IonIcon icon={createOutline} style={{ fontSize: '32px' }} />
                <span className='font-medium'>Post History</span>
              </div>
              <div className='flex items-center gap-2'>
                <IonButton
                  fill='outline'
                  onClick={() => setIsFilterOpen(true)}
                  className='rounded-full'
                  style={{
                    '--border-color': 'var(--color-umak-blue)',
                    '--color': 'var(--color-umak-blue)'
                  }}
                >
                  <IonIcon icon={funnelOutline} slot='start' className='mr-2' />
                  Filter
                </IonButton>
                <IonButton
                  fill='outline'
                  onClick={() => setIsSortOpen(true)}
                  className='rounded-full'
                  style={{
                    '--border-color': 'var(--color-umak-blue)',
                    '--color': 'var(--color-umak-blue)'
                  }}
                >
                  <IonIcon icon={timeOutline} slot='start' className='mr-2' />
                  {sortDir === 'desc' ? 'Recent Upload' : 'Oldest Upload'}
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </PostList>

        {/* Filter Modal */}
        <IonModal
          isOpen={isFilterOpen}
          onDidDismiss={() => setIsFilterOpen(false)}
          backdropDismiss={true}
          initialBreakpoint={0.4}
          breakpoints={[0, 0.4, 0.75]}
          className='font-default-font'
          style={{ '--border-radius': '2rem' }}
        >
          <div className='flex flex-col items-center pb-6'>
            <p className='my-4 text-base font-medium'>Filter Posts</p>
            <p className='-mt-2 mb-4 text-sm text-gray-500'>
              Select post statuses to be displayed.
            </p>
            <div className='flex flex-wrap justify-center px-4'>
              {ALL_FILTERS.map(f => (
                <FilterChip key={f} label={f} />
              ))}
            </div>
            <div className='mt-4 flex gap-2'>
              <IonButton
                fill='clear'
                onClick={() => {
                  setActiveFilters(new Set(['All']))
                }}
                style={{ '--color': 'var(--color-umak-blue)' }}
              >
                Clear filters
              </IonButton>
              <IonButton
                onClick={() => {
                  setIsFilterOpen(false)
                }}
                style={{
                  '--background': 'var(--color-umak-blue)',
                  '--color': 'white'
                }}
              >
                Apply
              </IonButton>
            </div>
          </div>
        </IonModal>

        {/* Sort Modal */}
        <IonModal
          isOpen={isSortOpen}
          onDidDismiss={() => setIsSortOpen(false)}
          backdropDismiss={true}
          initialBreakpoint={0.2}
          breakpoints={[0, 0.2, 0.35]}
          className='font-default-font'
          style={{ '--border-radius': '2rem' }}
        >
          <div className='flex flex-col items-center pb-4'>
            <p className='my-4 text-base font-medium'>Sort display order by</p>
            <div className='flex w-full'>
              <button
                className='flex flex-col items-center justify-center w-full gap-2 py-6'
                onClick={() => {
                  setSortDir('desc')
                  setIsSortOpen(false)
                }}
              >
                <IonIcon
                  icon={documentTextOutline}
                  size='large'
                  className='text-umak-blue'
                />
                <IonLabel className={sortDir === 'desc' ? 'font-semibold' : ''}>
                  Latest Upload (Desc)
                </IonLabel>
              </button>
              <button
                className='flex flex-col items-center justify-center w-full gap-2 py-6'
                onClick={() => {
                  setSortDir('asc')
                  setIsSortOpen(false)
                }}
              >
                <IonIcon
                  icon={documentTextOutline}
                  size='large'
                  className='text-umak-blue'
                />
                <IonLabel className={sortDir === 'asc' ? 'font-semibold' : ''}>
                  Oldest Upload (Asc)
                </IonLabel>
              </button>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </>
  )
}
