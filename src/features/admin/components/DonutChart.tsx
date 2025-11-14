import ApexCharts from 'apexcharts'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/shared/lib/supabase'
import fetchPaginatedRows from '@/shared/lib/supabasePaginatedFetch'
import { downloadOutline } from 'ionicons/icons'
import { IonIcon, IonButton } from '@ionic/react'

interface DonutChartProps {
  data: {
    claimed: number
    unclaimed: number
    toReview: number
    reported?: number
  }
}

export default function DonutChart ({ data }: DonutChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<ApexCharts | null>(null)
  const [range, setRange] = useState<
    'this_week' | 'this_month' | 'last_5_months' | 'last_year'
  >('this_week')
  const [fetched, setFetched] = useState<DonutChartProps['data'] | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const currentData = fetched ?? data
    console.log(currentData)

    const options: ApexCharts.ApexOptions = {
      chart: {
        type: 'donut',
        height: 180,
        toolbar: { show: false },
        sparkline: { enabled: true }
      },
      labels: ['Claimed', 'Unclaimed', 'To Review'],
      series: [
        currentData.claimed,
        currentData.unclaimed,
        currentData.toReview
      ],
      colors: ['#16a34a', '#ef4444', '#f59e0b'],
      dataLabels: {
        enabled: true,
        formatter: function (opts?: any) {
          const series = opts?.w?.globals?.series ?? []
          const total = series.reduce(
            (s: number, v: any) => s + Number(v || 0),
            0
          )
          const idx = opts?.seriesIndex ?? 0
          const pct =
            total > 0
              ? ((Number(series[idx] || 0) / total) * 100).toFixed(1)
              : '0.0'
          return `${pct}%`
        },
        style: {
          fontSize: '11px',
          fontWeight: 600,
          colors: ['#ffffff']
        },
        dropShadow: { enabled: false }
      },
      stroke: { width: 0 },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: { show: false }
          }
        }
      },
      legend: { show: false },
      tooltip: {
        enabled: true,
        y: {
          formatter: function (val: number) {
            const total =
              currentData.claimed + currentData.unclaimed + currentData.toReview
            const percent = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0'
            return `${val} (${percent}%)`
          }
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 150
            },
            dataLabels: {
              style: {
                fontSize: '10px'
              }
            }
          }
        }
      ]
    }

    const chart = new ApexCharts(chartRef.current, options)
    chart.render()
    chartInstance.current = chart

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
        chartInstance.current = null
      }
    }
  }, [data, fetched])

  // Fetch aggregated counts from Supabase for the selected range
  useEffect(() => {
    let mounted = true

    const getStartForRange = (r: typeof range) => {
      const end = new Date()
      switch (r) {
        case 'this_week': {
          const d = new Date()
          const start = new Date(d)
          start.setDate(d.getDate() - d.getDay())
          start.setHours(0, 0, 0, 0)
          return { start, end }
        }
        case 'this_month': {
          const start = new Date(end.getFullYear(), end.getMonth(), 1)
          start.setHours(0, 0, 0, 0)
          return { start, end }
        }
        case 'last_5_months': {
          const start = new Date(end.getFullYear(), end.getMonth() - 4, 1)
          start.setHours(0, 0, 0, 0)
          return { start, end }
        }
        case 'last_year': {
          const start = new Date(
            end.getFullYear() - 1,
            end.getMonth(),
            end.getDate()
          )
          start.setHours(0, 0, 0, 0)
          return { start, end }
        }
      }
    }

    const fetchCounts = async () => {
      const { start, end } = getStartForRange(range)

      try {
        const { data: rows, error } = await supabase
          .from('post_public_view')
          .select('*')
          .gte('submission_date', start.toISOString())
          .lte('submission_date', end.toISOString())

        if (error) {
          console.error('Failed to fetch donut data', error)
          return
        }

        let claimed = 0
        let toReview = 0
        let unclaimed = 0
        let reported = 0

        if (Array.isArray(rows)) {
          for (const r of rows) {
            const status = (r as any).status
            const post_status = (r as any).post_status
            const isReported = Boolean(
              (r as any).reported ||
                (r as any).is_reported ||
                (r as any).report_count
            )

            if (status === 'claimed') claimed++
            else if (post_status === 'pending') toReview++
            else unclaimed++

            if (isReported) reported++
          }
        }

        if (!mounted) return
        setFetched({ claimed, unclaimed, toReview, reported })
      } catch (err) {
        console.error(err)
      }
    }

    fetchCounts()
    return () => {
      mounted = false
    }
  }, [range])

  // CSV download
  const handleDownload = () => {
    // Determine start/end for the selected range
    const end = new Date()
    let start = new Date()
    switch (range) {
      case 'this_week': {
        const d = new Date()
        start = new Date(d)
        start.setDate(d.getDate() - d.getDay())
        start.setHours(0, 0, 0, 0)
        break
      }
      case 'this_month': {
        start = new Date(end.getFullYear(), end.getMonth(), 1)
        start.setHours(0, 0, 0, 0)
        break
      }
      case 'last_5_months': {
        start = new Date(end.getFullYear(), end.getMonth() - 4, 1)
        start.setHours(0, 0, 0, 0)
        break
      }
      case 'last_year': {
        start = new Date(end.getFullYear() - 1, end.getMonth(), end.getDate())
        start.setHours(0, 0, 0, 0)
        break
      }
    }

    ;(async () => {
      try {
        const header = [
          'poster_name',
          'item_name',
          'item_description',
          'last_seen_location',
          'accepted_by_staff_name',
          'submission_date',
          'claimed_by_name',
          'claimed_by_email',
          'accepted_on_date'
        ].join(',')

        const parts: string[] = []
        parts.push(header)

        await fetchPaginatedRows({
          supabase,
          table: 'post_public_view',
          select:
            'poster_name,item_name,item_description,last_seen_location,accepted_by_staff_name,submission_date,claimed_by_name,claimed_by_email,accepted_on_date',
          dateField: 'submission_date',
          gte: start.toISOString(),
          lte: end.toISOString(),
          batchSize: 10000,
          onBatch: async rows => {
            for (const r of rows) {
              const poster_name = (r as any).poster_name ?? ''
              const item_name = (r as any).item_name ?? ''
              const item_description = (r as any).item_description ?? ''
              const last_seen_location = (r as any).last_seen_location ?? ''
              const accepted_by_staff_name =
                (r as any).accepted_by_staff_name ?? ''
              const submission_date = (r as any).submission_date ?? ''
              const claimed_by_name = (r as any).claimed_by_name ?? ''
              const claimed_by_email = (r as any).claimed_by_email ?? ''
              const accepted_on_date = (r as any).accepted_on_date ?? ''

              const escaped = [
                poster_name,
                item_name,
                item_description,
                last_seen_location,
                accepted_by_staff_name,
                submission_date,
                claimed_by_name,
                claimed_by_email,
                accepted_on_date
              ]
                .map((c: any) => `"${String(c).replace(/"/g, '""')}"`)
                .join(',')

              parts.push(escaped)
            }
          }
        })

        const csv = parts.join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `status-summary-detailed-${range}-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (e) {
        console.error('Error generating donut detailed CSV', e)
      }
    })()
  }

  return (
    <div className='rounded-3xl w-full font-default-font!'>
      {/* Header */}
      <div className='mb-3 flex items-center justify-between'>
        <div className='text-sm font-semibold text-[#1f2a66]'>
          Status Summary
        </div>
        <div>
          <select
            value={range}
            onChange={e => setRange(e.target.value as any)}
            className='text-xs font-medium text-[#1f2a66] rounded border border-[#e5e7eb] px-2 py-1'
            aria-label='Select timeframe'
          >
            <option value='this_week'>This Week</option>
            <option value='this_month'>This Month</option>
            <option value='last_5_months'>Last 5 Months</option>
            <option value='last_year'>Last Year</option>
          </select>
        </div>
      </div>

      {/* Chart + Legend stacked for mobile */}
      <div className='flex flex-row items-center justify-evenly gap-3'>
        <div className='w-[160px]'>
          <div ref={chartRef} />
        </div>

        <div className='flex flex-col gap-2 text-xs font-medium text-[#1f2a66]'>
          <LegendItem color='#16a34a' label='Claimed' />
          <LegendItem color='#ef4444' label='Unclaimed' />
          <LegendItem color='#f59e0b' label='To Review' />
        </div>
      </div>

      {/* Bottom-right icon */}
      <div className='flex justify-end mt-4'>
        <IonButton
          onClick={handleDownload}
          className='w-20 flex text-base text-[#1f2a66] hover:bg-[#1f2a66]/5 transition-colors'
          aria-label='Download CSV'
          fill='clear'
        >
          <IonIcon icon={downloadOutline} slot='icon-only' />
        </IonButton>
      </div>
    </div>
  )
}

function LegendItem ({ color, label }: { color: string; label: string }) {
  return (
    <div className='flex items-center gap-1.5'>
      <span
        className='inline-block h-2.5 w-2.5 rounded-full'
        style={{ backgroundColor: color }}
      />
      <span className='font-default-font! text-black!'>{label}</span>
    </div>
  )
}
