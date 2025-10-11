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
  IonLoading
} from '@ionic/react'
import { notifications, personCircle } from 'ionicons/icons'
import { useCallback, useState, useRef, memo, useEffect } from 'react'
import Header from '@/components/shared/Header'
import CatalogPost from '@/components/user/home/CatalogPost'
import { Keyboard } from '@capacitor/keyboard'

// CatalogHeader Component
const CatalogHeader = memo(
  ({
    searchInput,
    setSearchInput
  }: {
    searchInput: string
    setSearchInput: (value: string) => void
  }) => {
    const searchRef = useRef<HTMLIonSearchbarElement>(null)
    const [unreadCount] = useState<number>(3)

    const handleFocus = async () => {
      console.log('Focused and keyboard shown')
      await searchRef.current?.setFocus()
      Keyboard.show()
    }

    return (
      <Header>
        <IonSearchbar
          ref={searchRef}
          onFocus={handleFocus}
          placeholder='Search'
          value={searchInput}
          showClearButton='focus'
          debounce={1000}
          onIonInput={event => setSearchInput(event.detail.value!)}
          style={
            {
              ['--border-radius']: '0.5rem'
            } as React.CSSProperties
          }
        />

        {/* Notification Icon with Badge */}
        <IonButtons slot='end'>
          <IonButton className='relative'>
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
            <IonIcon
              icon={personCircle}
              slot='icon-only'
              className='text-white text-2xl'
            />
          </IonButton>
        </IonButtons>
      </Header>
    )
  }
)

// Main Catalog Component
export default function Catalog () {
  const [searchInput, setSearchInput] = useState<string>('')
  const [posts, setPosts] = useState<number[]>([1, 2, 3, 4, 5])
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const contentRef = useRef<HTMLIonContentElement | null>(null)

  useEffect(() => {
    // parameter intentionally unused; prefix with underscore to satisfy linters
    const handler = (_ev?: Event) => {
      contentRef.current?.scrollToTop?.(300)
    }

    window.addEventListener('app:scrollToTop', handler as EventListener)
    return () =>
      window.removeEventListener('app:scrollToTop', handler as EventListener)
  }, [])

  // Pull to refresh handler
  const handleRefresh = useCallback((event: CustomEvent) => {
    setIsLoading(true) // start loader
    setTimeout(() => {
      //fetch new random posts
      event.detail.complete()
      setIsLoading(false) // hide loader after reload
    }, 1000)
  }, [])

  const loadMorePosts = async (event: CustomEvent<void>) => {
    const target = event.target as HTMLIonInfiniteScrollElement | null
    if (!target) return

    setTimeout(() => {
      const newItems = Array.from({ length: 5 }, (_, i) => posts.length + i + 1)
      setPosts(prev => [...prev, ...newItems])
      if (posts.length + newItems.length >= 20) {
        setHasMore(false)
      }

      target.complete()
    }, 1000)
  }
  return (
    <>
      <CatalogHeader
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />
      <IonContent ref={contentRef} className='ion-padding mb-16'>
        {/* Pull to refresh */}
        <div className='pb-6'>
          <IonRefresher slot='fixed' onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          {/* Dynamic CatalogPosts */}
          <div className='flex flex-col gap-4'>
            {posts.map((id, idx) => (
              <CatalogPost
                key={id}
                itemName={`Item Name ${id}`}
                description={`This is a test description for catalog post ${id}.`}
                lastSeen='10/09/2025 02:00 PM'
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

        {/* ✅ Show IonLoading while refreshing */}
        {isLoading && (
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
