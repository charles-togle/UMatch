import { useState, useEffect, useRef } from 'react'
import ApexCharts from 'apexcharts'
import { supabase } from '@/shared/lib/supabase'
import { IonSpinner } from '@ionic/react'

interface ChartData {
  labels: string[]
  series: number[][]
}

export default function SystemStatsChart () {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      setLoading(true)

      // Get last 12 weeks of data
      const weeks: string[] = []
      const missingData: number[] = []
      const foundData: number[] = []
      const claimedData: number[] = []

      const today = new Date()

      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(today)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7)
        weekStart.setHours(0, 0, 0, 0)

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)

        const weekLabel = `W${Math.floor(i / 4) + 1}`
        weeks.push(weekLabel)

        // Fetch missing posts for this week
        const { count: missingCount } = await supabase
          .from('item_table')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'missing')
          .gte('created_at', weekStart.toISOString())
          .lte('created_at', weekEnd.toISOString())

        // Fetch found posts for this week
        const { count: foundCount } = await supabase
          .from('item_table')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'found')
          .gte('created_at', weekStart.toISOString())
          .lte('created_at', weekEnd.toISOString())

        // Fetch claimed posts for this week
        const { count: claimedCount } = await supabase
          .from('item_table')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'claimed')
          .gte('created_at', weekStart.toISOString())
          .lte('created_at', weekEnd.toISOString())

        missingData.push(missingCount || 0)
        foundData.push(foundCount || 0)
        claimedData.push(claimedCount || 0)
      }

      setChartData({
        labels: weeks,
        series: [missingData, foundData, claimedData]
      })
    } catch (error) {
      console.error('Error fetching system stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Render chart when data changes
  useEffect(() => {
    if (!chartData || !chartRef.current) return

    const options: ApexCharts.ApexOptions = {
      chart: {
        type: 'line',
        height: 320,
        stacked: false,
        zoom: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      colors: ['#ef4444', '#10b981', '#3b82f6'],
      xaxis: {
        categories: chartData.labels,
        title: {
          text: 'Weeks'
        }
      },
      yaxis: {
        title: {
          text: 'Number of Items'
        },
        min: 0
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left'
      },
      dataLabels: {
        enabled: false
      }
    }

    const series = [
      {
        name: 'Missing Posts',
        data: chartData.series[0]
      },
      {
        name: 'Found Posts',
        data: chartData.series[1]
      },
      {
        name: 'Claimed Items',
        data: chartData.series[2]
      }
    ]

    const chart = new ApexCharts(chartRef.current, {
      ...options,
      series
    })

    chart.render()

    return () => {
      chart.destroy()
    }
  }, [chartData])

  if (loading) {
    return (
      <div className='flex items-center justify-center h-80'>
        <IonSpinner name='crescent' />
      </div>
    )
  }

  if (!chartData) {
    return (
      <div className='text-gray-500 text-center py-8'>No data available</div>
    )
  }

  return (
    <div className='w-full'>
      <div ref={chartRef} className='w-full' />
    </div>
  )
}
