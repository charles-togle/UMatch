import { IonCard, IonCardContent } from '@ionic/react'

interface AnalyticsCardProps {
  title: string
  value: number
  color: string
  textColor: string
}

export default function AnalyticsCard ({
  title,
  value,
  color,
  textColor
}: AnalyticsCardProps) {
  return (
    <IonCard className={`${color} rounded-lg flex flex-col justify-center`}>
      <IonCardContent>
        <p className='text-sm! font-semibold! text-slate-900 mb-2'>{title}</p>
        <p className={`text-3xl! font-bold ${textColor}`}>{value}</p>
      </IonCardContent>
    </IonCard>
  )
}
