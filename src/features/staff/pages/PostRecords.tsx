import {
  useState,
  useEffect,
  useRef,
  type MouseEventHandler,
  memo
} from 'react'
import {
  IonSearchbar,
  IonToast,
  IonContent,
  IonButton,
  IonIcon,
  IonModal,
  IonChip,
  IonLabel,
  IonCard,
  IonCardContent,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonActionSheet
} from '@ionic/react'
import {
  funnelOutline,
  timeOutline,
  documentTextOutline,
  listOutline
} from 'ionicons/icons'
import { Keyboard } from '@capacitor/keyboard'
import { useNavigation } from '@/shared/hooks/useNavigation'
import Header from '@/shared/components/Header'
import { listStaffPosts } from '@/features/posts/data/posts'
import { refreshStaffPosts } from '@/features/posts/data/postsRefresh'
import { usePostFetching } from '@/shared/hooks/usePostFetching'
import type { PublicPost } from '@/features/posts/types/post'
import CatalogPost from '@/features/user/components/home/CatalogPost'

// Header Component
const PostRecordsHeader = memo(
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

// Status filter types
type PostStatus =
  | 'All'
  | 'Missing'
  | 'Found'
  | 'Unclaimed'
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Claimed'
  | 'Fraud'
  | 'Declined'

const ALL_FILTERS: PostStatus[] = [
  'All',
  'Missing',
  'Found',
  'Unclaimed',
  'Pending',
  'Accepted',
  'Rejected',
  'Claimed',
  'Fraud',
  'Declined'
]

const STATUS_MAP: Record<Exclude<PostStatus, 'All'>, string> = {
  Missing: 'missing',
  Found: 'found',
  Unclaimed: 'unclaimed',
  Pending: 'pending',
  Accepted: 'accepted',
  Rejected: 'rejected',
  Claimed: 'claimed',
  Fraud: 'fraud',
  Declined: 'declined'
}

type SortDirection = 'asc' | 'desc'

export default function PostRecords () {
  const PAGE_SIZE = 5
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Set<PostStatus>>(
    new Set(['Accepted', 'Found'])
  )
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [allPosts, setAllPosts] = useState<PublicPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<PublicPost[]>([])
  const [showActions, setShowActions] = useState(false)
  const [activePostId, setActivePostId] = useState<string | null>(null)
  const contentRef = useRef<HTMLIonContentElement | null>(null)
  const { navigate } = useNavigation()

  // Use the reusable hook
  const {
    posts,
    hasMore,
    fetchPosts,
    loadMorePosts: hookLoadMorePosts,
    refreshPosts,
    loading
  } = usePostFetching({
    fetchFunction: listStaffPosts,
    refreshPostFunction: refreshStaffPosts,
    cacheKeys: {
      loadedKey: 'LoadedPosts:staff:records',
      cacheKey: 'CachedPublicPosts:staff:records'
    },
    pageSize: PAGE_SIZE,
    sortDirection: sortDir,
    onOffline: () => {
      setToastMessage(
        'Getting updated posts failed — not connected to the internet'
      )
      setToastColor('danger')
      setShowToast(true)
    }
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    setAllPosts(posts)
  }, [posts])

  useEffect(() => {
    setFilteredPosts(applySort(applyFilter(allPosts)))
  }, [activeFilters, sortDir, allPosts])

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

  useEffect(() => {
    const handler = (_ev?: Event) => {
      contentRef.current?.scrollToTop?.(300)
    }

    window.addEventListener('app:scrollToTop', handler as EventListener)
    return () =>
      window.removeEventListener('app:scrollToTop', handler as EventListener)
  }, [])

  const handleLoadMore = async (event: CustomEvent<void>) => {
    await hookLoadMorePosts()
    const target = event.target as HTMLIonInfiniteScrollElement | null
    if (target) target.complete()
  }

  const handleRefresh = async (event: CustomEvent) => {
    await refreshPosts()
    event.detail.complete()
  }

  const handleSearchBarClick = () => {
    Keyboard.hide()
    navigate('/staff/search')
  }

  const handlePostClick = (postId: string) => {
    setActivePostId(postId)
    setShowActions(true)
  }

  const handleActionSheetClick = (action: string) => {
    if (!activePostId) return

    switch (action) {
      case 'view':
        navigate(`/staff/post/view/${activePostId}`)
        break
      case 'share':
        // Share URL with user domain
        const shareUrl = `${window.location.origin}/user/post/view/${activePostId}`
        if (navigator.share) {
          navigator.share({
            title: 'Check out this post',
            url: shareUrl
          })
        } else {
          navigator.clipboard.writeText(shareUrl)
          setToastMessage('Link copied to clipboard')
          setToastColor('success')
          setShowToast(true)
        }
        break
      case 'notify':
        // TODO: Implement notify owner
        setToastMessage('Notify owner functionality coming soon')
        setToastColor('success')
        setShowToast(true)
        break
      case 'claim':
        // TODO: Implement claim item
        setToastMessage('Claim item functionality coming soon')
        setToastColor('success')
        setShowToast(true)
        break
    }
  }

  // Skeleton component
  const PostSkeleton = () => (
    <IonCard className='mb-3'>
      <IonCardContent>
        <div className='flex items-start gap-3'>
          {/* Image skeleton */}
          <div className='w-24 h-24 rounded-lg overflow-hidden flex-shrink-0'>
            <IonSkeletonText
              animated
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* Content skeleton */}
          <div className='flex-1'>
            <IonSkeletonText
              animated
              style={{ width: '60%', height: '20px', marginBottom: '8px' }}
            />
            <IonSkeletonText
              animated
              style={{ width: '40%', height: '16px', marginBottom: '8px' }}
            />
            <IonSkeletonText
              animated
              style={{ width: '80%', height: '14px', marginBottom: '4px' }}
            />
            <IonSkeletonText
              animated
              style={{ width: '70%', height: '14px' }}
            />
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  )

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

  return (
    <>
      <PostRecordsHeader handleClick={handleSearchBarClick} />
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position='top'
        color={toastColor}
      />
      {loading ? (
        <IonContent ref={contentRef} className='mb-16 bg-default-bg'>
          <div>
            {/* Top action row skeleton */}
            <IonCard className='px-4 mb-3'>
              <IonCardContent className='flex items-center justify-between gap-3'>
                <div className='flex items-center mb-2 gap-2'>
                  <IonSkeletonText
                    animated
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%'
                    }}
                  />
                  <IonSkeletonText
                    animated
                    style={{ width: '120px', height: '20px' }}
                  />
                </div>
                <div className='flex items-center gap-2'>
                  <IonSkeletonText
                    animated
                    style={{
                      width: '100px',
                      height: '36px',
                      borderRadius: '20px'
                    }}
                  />
                  <IonSkeletonText
                    animated
                    style={{
                      width: '140px',
                      height: '36px',
                      borderRadius: '20px'
                    }}
                  />
                </div>
              </IonCardContent>
            </IonCard>

            {/* Post skeletons */}
            {[...Array(3)].map((_, index) => (
              <PostSkeleton key={index} />
            ))}
          </div>
        </IonContent>
      ) : filteredPosts.length === 0 ? (
        <IonContent ref={contentRef} className='mb-16 bg-default-bg'>
          <div>
            {/* Top action row */}
            <IonCard className='px-4 mb-3'>
              <IonCardContent className='flex items-center justify-between gap-3'>
                <div className='flex items-center mb-2 gap-2 text-umak-blue'>
                  <IonIcon icon={listOutline} style={{ fontSize: '32px' }} />
                  <span className='font-medium'>Post Records</span>
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
                    <IonIcon
                      icon={funnelOutline}
                      slot='start'
                      className='mr-2'
                    />
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

            <div className='flex justify-center items-center h-64 text-gray-400'>
              <p>No posts match the selected filters</p>
            </div>
          </div>
        </IonContent>
      ) : (
        <IonContent ref={contentRef} className='mb-16 bg-default-bg'>
          <IonRefresher slot='fixed' onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          <div>
            {/* Top action row */}
            <IonCard className='px-4 mb-3'>
              <IonCardContent className='flex items-center justify-between gap-3'>
                <div className='flex items-center mb-2 gap-2 text-umak-blue'>
                  <IonIcon icon={listOutline} style={{ fontSize: '32px' }} />
                  <span className='font-medium'>Post Records</span>
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
                    <IonIcon
                      icon={funnelOutline}
                      slot='start'
                      className='mr-2'
                    />
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

            {/* Posts */}
            {filteredPosts.map(post => (
              <div className='w-full h-full mb-4'>
                <CatalogPost
                  key={post.post_id}
                  postId={post.post_id}
                  username={post.username}
                  user_profile_picture_url={post.profilepicture_url}
                  itemName={post.item_name}
                  description={post.item_description || ''}
                  lastSeen={post.submission_date || ''}
                  imageUrl={post.item_image_url || ''}
                  locationLastSeenAt={post.last_seen_location || ''}
                  itemStatus={post.item_status}
                  onClick={() => handlePostClick(post.post_id)}
                  is_anonymous={post.is_anonymous}
                  onKebabButtonlick={() => setShowActions(true)}
                />
              </div>
            ))}

            {hasMore && (
              <IonInfiniteScroll
                onIonInfinite={handleLoadMore}
                threshold='100px'
                className='my-2'
              >
                <IonInfiniteScrollContent loadingSpinner='crescent' />
              </IonInfiniteScroll>
            )}

            {!hasMore && !loading && filteredPosts.length > 0 && (
              <div className='text-center text-gray-500 py-4'>
                You're all caught up!
              </div>
            )}
          </div>
        </IonContent>
      )}

      {/* Filter Modal */}
      <IonModal
        isOpen={isFilterOpen}
        onDidDismiss={() => setIsFilterOpen(false)}
        backdropDismiss={true}
        initialBreakpoint={0.5}
        breakpoints={[0, 0.5, 0.75]}
        className='font-default-font'
        style={{ '--border-radius': '2rem' }}
      >
        <div className='flex flex-col items-center pb-6'>
          <p className='my-4 text-base font-medium'>Filter Posts</p>
          <p className='-mt-2 mb-4 text-sm text-gray-500'>
            Select multiple post statuses to be displayed.
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

      {/* Custom Action Sheet for Post Records */}
      <IonActionSheet
        isOpen={showActions}
        onDidDismiss={() => setShowActions(false)}
        buttons={[
          {
            text: 'View details',
            handler: () => handleActionSheetClick('view')
          },
          {
            text: 'Share',
            handler: () => handleActionSheetClick('share')
          },
          {
            text: 'Notify the owner',
            handler: () => handleActionSheetClick('notify')
          },
          {
            text: 'Claim Item',
            handler: () => handleActionSheetClick('claim')
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]}
      />
    </>
  )
}
