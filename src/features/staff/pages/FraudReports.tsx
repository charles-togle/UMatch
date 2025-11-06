import { useState, useEffect, useRef, memo } from 'react'
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonSkeletonText,
  IonIcon,
  IonToast,
  IonButton,
  IonModal,
  IonChip,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/react'
import {
  shieldCheckmarkOutline,
  funnelOutline,
  timeOutline,
  documentTextOutline
} from 'ionicons/icons'
import Header from '@/shared/components/Header'
import { useNavigation } from '@/shared/hooks/useNavigation'
import { useFraudReports } from '@/features/staff/hooks/useFraudReports'
import type { FraudReportPublic } from '@/features/staff/hooks/useFraudReports'
import FraudReportCard from '@/features/staff/components/FraudReportCard'
import FraudReportSkeleton from '@/features/staff/components/FraudReportSkeleton'

// Report Status filter types
type ReportStatus = 'All' | 'Under Review' | 'Verified' | 'Rejected'

const ALL_FILTERS: ReportStatus[] = [
  'All',
  'Under Review',
  'Verified',
  'Rejected'
]

const STATUS_MAP: Record<Exclude<ReportStatus, 'All'>, string> = {
  'Under Review': 'under_review',
  Verified: 'verified',
  Rejected: 'rejected'
}

type SortDirection = 'asc' | 'desc'

// Filter Chip Component
const FilterChip = memo(
  ({
    label,
    isActive,
    onClick
  }: {
    label: ReportStatus
    isActive: boolean
    onClick: () => void
  }) => {
    return (
      <IonChip
        onClick={onClick}
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
)

// moved FraudReportSkeleton to its own file

export default function FraudReport () {
  const PAGE_SIZE = 5
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Set<ReportStatus>>(
    new Set(['All'])
  )
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [allReports, setAllReports] = useState<FraudReportPublic[]>([])
  const [filteredReports, setFilteredReports] = useState<FraudReportPublic[]>(
    []
  )
  const contentRef = useRef<HTMLIonContentElement | null>(null)
  const { navigate } = useNavigation()

  const {
    reports,
    hasMore,
    fetchReports,
    loadMoreReports,
    fetchNewReports,
    loading
  } = useFraudReports({
    cacheKeys: {
      loadedKey: 'LoadedReports:staff:fraud',
      cacheKey: 'CachedFraudReports:staff'
    },
    pageSize: PAGE_SIZE,
    sortDirection: sortDir,
    onOffline: () => {
      setToastMessage(
        'Getting updated reports failed — not connected to the internet'
      )
      setToastColor('danger')
      setShowToast(true)
    }
  })

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    setAllReports(reports)
  }, [reports])

  useEffect(() => {
    setFilteredReports(applySort(applyFilter(allReports)))
    console.log(allReports)
  }, [activeFilters, sortDir, allReports])

  const applyFilter = (items: FraudReportPublic[]): FraudReportPublic[] => {
    if (activeFilters.has('All')) return items

    const expectedValues = Array.from(activeFilters)
      .filter(f => f !== 'All')
      .map(f => STATUS_MAP[f as Exclude<ReportStatus, 'All'>].toLowerCase())

    return items.filter(report => {
      const reportStatus = (report.report_status || '').toLowerCase()
      return expectedValues.includes(reportStatus)
    })
  }

  const applySort = (items: FraudReportPublic[]): FraudReportPublic[] => {
    return [...items].sort((a, b) => {
      const as = a.date_reported || ''
      const bs = b.date_reported || ''
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
      // Scroll to top immediately (don't wait for fetch)
      contentRef.current?.scrollToTop?.(300)

      // Fetch newest reports in background
      fetchNewReports()
        .then(() => {
          setToastMessage('Reports updated')
          setToastColor('success')
          setShowToast(true)
        })
        .catch(() => {
          setToastMessage('Failed to fetch new reports')
          setToastColor('danger')
          setShowToast(true)
        })
    }

    window.addEventListener('app:scrollToTop', handler as EventListener)
    return () =>
      window.removeEventListener('app:scrollToTop', handler as EventListener)
  }, [fetchNewReports])

  const handleLoadMore = async (event: CustomEvent<void>) => {
    const target = event.target as HTMLIonInfiniteScrollElement | null
    if (!target) return
    await loadMoreReports()
    target.complete()
  }

  const handleRefresh = async (event: CustomEvent) => {
    await fetchNewReports()
    event.detail.complete()
  }

  const handleReportClick = (reportId: string) => {
    navigate(`/staff/fraud-report/view/${reportId}`)
  }

  const handleFilterClick = (label: ReportStatus) => {
    // Only one filter can be active at a time
    setActiveFilters(new Set([label]))
    // Close the modal immediately after selection
    setIsFilterOpen(false)
  }

  return (
    <>
      <Header logoShown={true} />
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
          <div className='p-4'>
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
                    style={{ width: '150px', height: '20px' }}
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
            {[...Array(3)].map((_, index) => (
              <FraudReportSkeleton key={index} />
            ))}
          </div>
        </IonContent>
      ) : filteredReports.length === 0 ? (
        <IonContent ref={contentRef} className='mb-16 bg-default-bg'>
          <div className='p-4'>
            <IonCard className='px-4 mb-3'>
              <IonCardContent className='flex items-center justify-between gap-3'>
                <div className='flex items-center mb-2 gap-2 text-umak-blue'>
                  <IonIcon
                    icon={shieldCheckmarkOutline}
                    style={{ fontSize: '32px' }}
                  />
                  <span className='font-medium'>Fraud Reports</span>
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
                    {sortDir === 'desc' ? 'Recent' : 'Oldest'}
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>

            <div className='flex justify-center items-center h-64 text-gray-400'>
              <p>No fraud reports match the selected filters</p>
            </div>
          </div>
        </IonContent>
      ) : (
        <IonContent ref={contentRef} className='mb-16 bg-default-bg'>
          <IonRefresher slot='fixed' onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          <div>
            <IonCard className='px-4 mb-3'>
              <IonCardContent className='flex items-center justify-between gap-3'>
                <div className='flex items-center mb-2 gap-2 text-umak-blue'>
                  <IonIcon
                    icon={shieldCheckmarkOutline}
                    style={{ fontSize: '32px' }}
                  />
                  <span className='font-medium'>Fraud Reports</span>
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
                    {sortDir === 'desc' ? 'Recent' : 'Oldest'}
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>

            {filteredReports.map(report => (
              <FraudReportCard
                key={report.report_id}
                reportId={report.report_id}
                posterName={report.poster_name || undefined}
                posterProfilePictureUrl={report.poster_profile_picture_url}
                reporterName={report.reporter_name || undefined}
                reporterProfilePictureUrl={report.reporter_profile_picture_url}
                itemName={report.item_name || undefined}
                itemDescription={report.item_description || undefined}
                lastSeenAt={report.last_seen_at || undefined}
                reasonForReporting={report.reason_for_reporting || undefined}
                dateReported={report.date_reported || undefined}
                itemImageUrl={report.item_image_url || undefined}
                reportStatus={report.report_status}
                onClick={handleReportClick}
              />
            ))}

            {hasMore && (
              <IonInfiniteScroll
                onIonInfinite={handleLoadMore}
                threshold='100px'
              >
                <IonInfiniteScrollContent loadingText='Loading more reports...' />
              </IonInfiniteScroll>
            )}

            {!hasMore && filteredReports.length > 0 && (
              <div className='text-center text-gray-500 pb-16'>
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
        initialBreakpoint={0.4}
        breakpoints={[0, 0.4, 0.6]}
        className='font-default-font'
        style={{ '--border-radius': '2rem' }}
      >
        <div className='flex flex-col items-center pb-6'>
          <p className='my-4 text-base font-medium'>Filter Reports</p>
          <p className='-mt-2 mb-4 text-sm text-gray-500'>
            Select a report status
          </p>
          <div className='flex flex-wrap justify-center px-4'>
            {ALL_FILTERS.map(f => (
              <FilterChip
                key={f}
                label={f}
                isActive={activeFilters.has(f)}
                onClick={() => handleFilterClick(f)}
              />
            ))}
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
          <p className='my-4 text-base font-medium'>Sort by date reported</p>
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
                Most Recent
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
                Oldest First
              </IonLabel>
            </button>
          </div>
        </div>
      </IonModal>
    </>
  )
}
