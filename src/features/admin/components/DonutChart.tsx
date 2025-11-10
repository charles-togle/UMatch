import ApexCharts from 'apexcharts'
import { useEffect, useRef } from 'react'

interface DonutChartProps {
  data: {
    claimed: number
    unclaimed: number
    toReview: number
    reported: number
  }
}

export default function DonutChart ({ data }: DonutChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const options: ApexCharts.ApexOptions = {
      chart: {
        type: 'donut',
        sparkline: {
          enabled: false
        }
      },
      labels: ['Claimed', 'Unclaimed', 'To Review', 'Reported'],
      series: [data.claimed, data.unclaimed, data.toReview, data.reported],
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'],
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '16px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                color: '#374151'
              },
              value: {
                show: true,
                fontSize: '18px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                color: '#1f2937',
                formatter: (val: string) => {
                  return val
                }
              },
              total: {
                show: true,
                label: 'Total',
                fontSize: '14px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                color: '#6b7280',
                formatter: (w: any) => {
                  return w.globals.seriesTotals.reduce(
                    (a: number, b: number) => {
                      return a + b
                    },
                    0
                  )
                }
              }
            }
          }
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ],
      legend: {
        position: 'bottom',
        fontSize: '14px',
        fontFamily: 'Helvetica, Arial, sans-serif'
      }
    }

    const chart = new ApexCharts(chartRef.current, options)
    chart.render()

    return () => {
      chart.destroy()
    }
  }, [data])

  return <div ref={chartRef} className='w-full' />
}
