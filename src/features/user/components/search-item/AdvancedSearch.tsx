import { useState } from 'react'
import { IonButton, IonIcon } from '@ionic/react'
import { searchOutline } from 'ionicons/icons'
import ItemStatusSelector from '../shared/ItemStatusSelector'
import LastSeenModal from '../shared/LastSeenModal'
import LocationDetailsSelector from '../shared/LocationDetailsSelector'
import ImageUpload from '@/shared/components/ImageUpload'

const toISODate = (date: string, time: string, meridian: 'AM' | 'PM') => {
  const [month, day, year] = date.split('/')
  let [hours, minutes] = time.split(':').map(Number)
  if (meridian === 'PM' && hours < 12) hours += 12
  if (meridian === 'AM' && hours === 12) hours = 0

  // Create a date string that represents UTC+8 time
  const paddedMonth = month.padStart(2, '0')
  const paddedDay = day.padStart(2, '0')
  const paddedHours = hours.toString().padStart(2, '0')
  const paddedMinutes = minutes.toString().padStart(2, '0')

  // Return ISO string with +08:00 offset
  return `${year}-${paddedMonth}-${paddedDay}T${paddedHours}:${paddedMinutes}:00+08:00`
}

export default function AdvancedSearch () {
  // ------------------ STATES ------------------
  const now = new Date()
  // Convert to UTC+8 (Philippine Time)
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000
  const utc8Time = utcTime + 8 * 3600000
  const local = new Date(utc8Time)
  let hours = local.getHours()
  const minutes = local.getMinutes().toString().padStart(2, '0')
  const [date, setDate] = useState(
    local.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
  )

  const meridianVal = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12

  const [status, setStatus] = useState<'lost' | 'found'>('lost')
  const [time, setTime] = useState(`${hours}:${minutes}`)
  const [meridian, setMeridian] = useState(meridianVal as 'AM' | 'PM')
  const [locationDetails, setLocationDetails] = useState({
    level1: '',
    level2: '',
    level3: ''
  })

  const [image, setImage] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleDateChange = (e: CustomEvent) => {
    const iso = e.detail.value as string
    if (iso) {
      // Parse the ISO string and treat it as UTC+8
      const d = new Date(iso)

      const formattedDate = d.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Manila'
      })
      let hours = d.getHours()
      const minutes = d.getMinutes().toString().padStart(2, '0')
      const meridianVal = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12 || 12
      const formattedTime = `${hours}:${minutes}`

      setDate(formattedDate)
      setTime(formattedTime)
      setMeridian(meridianVal as 'AM' | 'PM')
    }
  }

  // ------------------ FORM SUBMIT ------------------
  const handleSearch = () => {
    const searchResult = {
      status,
      lastSeen: { date, time, meridian },
      locationDetails,
      image: image ? image.name : null
    }
    setResult(searchResult)
    console.log('Search Object:', searchResult)
  }

  // ------------------ UI ------------------
  return (
    <div className=' bg-gray-50 mb-5 w-full'>
      <div className='mx-5 mt-3 rounded-xl shadow-md p-4 border border-gray-200'>
        <div className='flex items-center space-x-2 mb-3'>
          <IonIcon
            icon={searchOutline}
            className='text-[#1e2b87]'
            style={{ fontSize: '32px', ['--ionicon-stroke-width']: '40px' }}
          />
          <div className='text-umak-blue font-default-font text-base font-light'>
            Advanced Search
          </div>
        </div>
        <div className='h-px w-full bg-black my-3'> </div>

        <div className='max-w-2/3'>
          <ItemStatusSelector value={status} onChange={setStatus} />
        </div>
        <LastSeenModal
          date={toISODate(date, time, meridian)}
          handleDateChange={handleDateChange}
        />
        <LocationDetailsSelector
          locationDetails={locationDetails}
          setLocationDetails={setLocationDetails}
        />

        {/* IMAGE UPLOAD */}
        <ImageUpload
          label='Reverse Image Search'
          image={image}
          onImageChange={setImage}
        />

        {/* SEARCH BUTTON */}
        <IonButton
          expand='block'
          className=' text-white font-default-font rounded-md'
          onClick={handleSearch}
          style={
            {
              ['--background']: 'var(--color-umak-blue, #1D2981)'
            } as React.CSSProperties
          }
        >
          SEARCH
        </IonButton>
        {/* RESULT JSON */}
        {result && (
          <pre className='mt-4 text-xs mb-15 bg-gray-100 p-2 rounded-md overflow-x-auto'>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
