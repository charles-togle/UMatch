interface AnalyticsCardProps {
  title: string
  value: number
  color: string
  borderColor: string
  textColor: string
}

export default function AnalyticsCard ({
  title,
  value,
  color,
  borderColor,
  textColor
}: AnalyticsCardProps) {
  return (
    <div
      className={`${color} border ${borderColor} rounded-lg p-4 flex flex-col justify-center`}
    >
      <p className='text-sm text-gray-600 mb-2'>{title}</p>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  )
}
