import { useState, useEffect } from 'react'
import { IonContent, IonCard, IonCardContent, IonSpinner } from '@ionic/react'
import { barChartOutline } from 'ionicons/icons'
import Header from '@/shared/components/Header'
import CardHeader from '@/shared/components/CardHeader'
import { supabase } from '@/shared/lib/supabase'
import AnalyticsCard from '../components/AnalyticsCard'
import DonutChart from '../components/DonutChart'
import SystemStatsChart from '../components/SystemStatsChart'

interface DashboardStats {
  pendingVerifications: number
  pendingFraudReports: number
  claimedCount: number
  unclaimedCount: number
  toReviewCount: number
  reportedCount: number
}

export default function Dashboard () {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch Pending Verifications (pending status from post_table)
      const { count: pendingCount } = await supabase
        .from('post_table')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Fetch Pending Fraud Reports (reported status from post_table)
      const { count: fraudCount } = await supabase
        .from('post_table')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'reported')

      // Fetch item status counts from item_table
      const { count: claimedCount } = await supabase
        .from('item_table')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'claimed')

      const { count: unclaimedCount } = await supabase
        .from('item_table')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unclaimed')

      // For To Review - use Pending status from post_table
      const { count: toReviewCount } = await supabase
        .from('post_table')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      setStats({
        pendingVerifications: pendingCount || 0,
        pendingFraudReports: fraudCount || 0,
        claimedCount: claimedCount || 0,
        unclaimedCount: unclaimedCount || 0,
        toReviewCount: toReviewCount || 0,
        reportedCount: fraudCount || 0
      })
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

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
          {/* Page Header */}
          <IonCard className='shadow-none! rounded-none!'>
            <IonCardContent className='pt-0!'>
              <CardHeader title='Graphical Reports' icon={barChartOutline} />
            </IonCardContent>
          </IonCard>

          {/* Analytics Cards Row */}
          <div className='px-4 py-4 grid grid-cols-2 gap-4'>
            <AnalyticsCard
              title='Pending Verifications'
              value={stats.pendingVerifications}
              color='bg-blue-50'
              borderColor='border-blue-200'
              textColor='text-blue-700'
            />
            <AnalyticsCard
              title='Pending Fraud Reports'
              value={stats.pendingFraudReports}
              color='bg-red-50'
              borderColor='border-red-200'
              textColor='text-red-700'
            />
          </div>

          {/* Donut Chart Card */}
          <IonCard className='mx-4 mb-4'>
            <IonCardContent className='py-6'>
              <h3 className='text-lg font-semibold mb-4 text-slate-800'>
                Item Status Distribution
              </h3>
              <DonutChart
                data={{
                  claimed: stats.claimedCount,
                  unclaimed: stats.unclaimedCount,
                  toReview: stats.toReviewCount,
                  reported: stats.reportedCount
                }}
              />
            </IonCardContent>
          </IonCard>

          {/* System Stats Chart Card */}
          <IonCard className='mx-4 mb-4'>
            <IonCardContent className='py-6'>
              <h3 className='text-lg font-semibold mb-4 text-slate-800'>
                System Statistics
              </h3>
              <SystemStatsChart />
            </IonCardContent>
          </IonCard>
        </div>
      ) : null}
    </IonContent>
  )
}
