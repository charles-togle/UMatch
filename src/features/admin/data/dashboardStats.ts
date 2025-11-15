import { supabase } from '@/shared/lib/supabase'

export interface DashboardStats {
  pendingVerifications: number
  pendingFraudReports: number
  claimedCount: number
  unclaimedCount: number
  toReviewCount: number
  lostCount: number
  returnedCount: number
  reportedCount: number
}

export async function getDashboardStats (): Promise<DashboardStats> {
  // Mirrors previous inline logic in Dashboard.tsx
  const { data, error } = await supabase.rpc('get_dashboard_stats')
  if (error) throw error

  return {
    pendingVerifications: data[0].pendingCount || 0,
    pendingFraudReports: data[0].fraudCount || 0,
    claimedCount: data[0].claimedCount || 0,
    unclaimedCount: data[0].unclaimedCount || 0,
    toReviewCount: data[0].toReviewCount || 0,
    lostCount: data[0].lostCount || 0,
    returnedCount: data[0].returnedCount || 0,
    reportedCount: data[0].fraudCount || 0
  }
}
