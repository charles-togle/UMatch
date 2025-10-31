import { IonCard, IonCardContent, IonImg } from '@ionic/react'
import CardHeader from '@/shared/components/CardHeader'
import { personCircle } from 'ionicons/icons'

export default function PostCard ({
  imgUrl,
  title,
  description,
  owner
}: {
  imgUrl: string
  title: string
  description: string
  owner: string
}) {
  return (
    <IonCard className='rounded-2xl mt-4'>
      <IonCardContent>
        <CardHeader title={owner} icon={personCircle} hasLineBelow={false} />
        <div className='flex justify-start items-center mt-3'>
          <div className='aspect-[16/13] overflow-hidden rounded-xl max-w-30 border-2 border-slate-900'>
            <IonImg
              className='w-full h-full object-cover'
              src={imgUrl}
              alt={title}
            />
          </div>
          <div className='ml-4 max-w-1/2 max-h-2/3 overflow-hidden font-default-font font-bold text-black'>
            <p className='font-default-font font-bold! text-lg! truncate!'>
              {title}
            </p>
            <p className='text-slate-900 pb-2 truncate!'>{description}</p>
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  )
}
