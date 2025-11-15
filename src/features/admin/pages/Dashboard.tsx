import { useState, useEffect } from 'react'
import { IonContent, IonCard, IonCardContent, IonSpinner } from '@ionic/react'
import { barChart } from 'ionicons/icons'
import Header from '@/shared/components/Header'
import { getDashboardStats } from '@/features/admin/data/dashboardStats'
import type { DashboardStats } from '@/features/admin/data/dashboardStats'
import AnalyticsCard from '../components/AnalyticsCard'
import DonutChart from '../components/DonutChart'
import SystemStatsChart from '../components/SystemStatsChart'
import CardHeader from '@/shared/components/CardHeader'

export default function Dashboard () {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load dashboard stats using centralized data helper
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const result: DashboardStats = await getDashboardStats()
        setStats(result)
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError('Failed to load dashboard statistics')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <IonContent>
      <Header logoShown isProfileAndNotificationShown />

      {loading ? (
        <div className='flex items-center justify-center h-96'>
          <IonSpinner name='crescent' />
        </div>
      ) : error ? (
        <div className='p-4'>
          <div className='p-4 bg-red-50 border border-red-200 rounded-lg text-red-600'>
            {error}
          </div>
        </div>
      ) : stats ? (
        <div className='pb-16'>
          <IonCard className='mt-3'>
            <IonCardContent>
              <CardHeader
                title='Graphical Reports'
                icon={barChart}
                hasLineBelow={false}
              />
            </IonCardContent>
          </IonCard>
          {/* Analytics Cards Row */}
          <div className='px-4 py-4 grid grid-cols-2 gap-4'>
            <AnalyticsCard
              title='Pending Verifications'
              value={stats.pendingVerifications}
              color='bg-white'
              textColor='text-blue-700'
            />
            <AnalyticsCard
              title='Pending Fraud Reports'
              value={stats.pendingFraudReports}
              color='bg-white'
              textColor='text-red-700'
            />
          </div>

          {/* Donut Chart Card */}
          <IonCard className='mx-4 mb-4'>
            <IonCardContent className='py-6'>
              <DonutChart
                data={{
                  claimed: stats.claimedCount,
                  unclaimed: stats.unclaimedCount,
                  toReview: stats.toReviewCount,
                  lost: stats.lostCount,
                  returned: stats.returnedCount
                }}
              />
            </IonCardContent>
          </IonCard>

          {/* System Stats Chart Card */}
          <IonCard className='mx-4 mb-4'>
            <IonCardContent className='py-6'>
              <SystemStatsChart />
            </IonCardContent>
          </IonCard>
        </div>
      ) : null}
    </IonContent>
  )
}
