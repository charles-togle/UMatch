import { useState, useMemo, useRef } from 'react'
import {
  IonSelect,
  IonSelectOption,
  IonButton,
  IonModal,
  IonDatetime,
  IonDatetimeButton,
  IonIcon
} from '@ionic/react'
import { locationsData } from '@/configs/locationsData'
import type { BuildingData, FloorData } from '@/configs/locationsData'
import { searchOutline } from 'ionicons/icons'
import CustomRadioGroup from '@/components/shared/CustomRadioGroup'
import ImageUpload from '@/components/shared/ImageUpload'

interface ItemStatusSelectorProps {
  value: 'lost' | 'found'
  onChange: (value: 'lost' | 'found') => void
  className?: string
}

const ItemStatusSelector: React.FC<ItemStatusSelectorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className='w-1/2'>
        <CustomRadioGroup
          label='Item Status'
          value={value}
          options={[
            { label: 'Lost', value: 'lost' },
            { label: 'Found', value: 'found' }
          ]}
          onChange={val => onChange(val as 'lost' | 'found')}
          direction='horizontal'
        />
      </div>
    </div>
  )
}

interface LastSeenModalProps {
  date?: string
  handleDateChange: (e: CustomEvent) => void
}

const LastSeenModal: React.FC<LastSeenModalProps> = ({
  date,
  handleDateChange
}) => {
  const modalRef = useRef<HTMLIonModalElement>(null)

  const handleCloseModal = () => {
    modalRef.current?.dismiss()
  }

  return (
    <div className='mb-4'>
      <p className='font-default-font text-2xl font-bold mb-2'>Last Seen</p>
      <div className='flex flex-col space-x-3'>
        {/* Date & Time Picker */}
        <div className='flex flex-row justify-start space-x-5 items-center'>
          <IonDatetimeButton datetime='datetime' />
          <IonModal keepContentsMounted={true}>
            <IonDatetime
              id='datetime'
              presentation='date-time'
              value={date}
              onIonChange={handleDateChange}
              formatOptions={{
                date: {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                },
                time: {
                  hour: '2-digit',
                  minute: '2-digit'
                }
              }}
            />
            <IonButton onClick={handleCloseModal}>Enter</IonButton>
          </IonModal>
        </div>
      </div>
    </div>
  )
}

interface LocationDetails {
  building: string
  floor: string
  place: string
}

interface LocationDetailsSelectorProps {
  details: LocationDetails
  setDetails: React.Dispatch<React.SetStateAction<LocationDetails>>
  className?: string
}

const LocationDetailsSelector: React.FC<LocationDetailsSelectorProps> = ({
  details,
  setDetails,
  className = ''
}) => {
  // ------------------ DYNAMIC OPTIONS ------------------
  const buildingOptions: string[] = locationsData.map(
    (b: BuildingData) => b.name
  )

  const floorOptions: string[] = useMemo(() => {
    const building: BuildingData | undefined = locationsData.find(
      (b: BuildingData) => b.name === details.building
    )
    return building ? building.floors.map((f: FloorData) => f.name) : []
  }, [details.building])

  const placeOptions: string[] = useMemo(() => {
    const building: BuildingData | undefined = locationsData.find(
      (b: BuildingData) => b.name === details.building
    )
    const floor: FloorData | undefined = building?.floors.find(
      (f: FloorData) => f.name === details.floor
    )
    const subPlaces: string[] = floor ? floor.subPlaces : []
    return subPlaces.length ? subPlaces : ['Not Applicable']
  }, [details.building, details.floor])

  // ------------------ UI ------------------
  return (
    <div className={`mb-4 ${className}`}>
      <p className='font-default-font text-2xl font-bold mb-2'>Details</p>

      {/* Building / Area */}
      <IonSelect
        placeholder='Building/Area'
        value={details.building}
        onIonChange={e =>
          setDetails(prev => ({
            ...prev,
            building: e.detail.value,
            floor: '',
            place: ''
          }))
        }
      >
        {buildingOptions.map((b: string) => (
          <IonSelectOption key={b} value={b}>
            {b}
          </IonSelectOption>
        ))}
      </IonSelect>

      {/* Floor / Side */}
      <IonSelect
        placeholder='Floor/Side'
        disabled={!details.building}
        value={details.floor}
        onIonChange={e =>
          setDetails(prev => ({
            ...prev,
            floor: e.detail.value,
            place: ''
          }))
        }
      >
        {floorOptions.map((f: string) => (
          <IonSelectOption key={f} value={f}>
            {f}
          </IonSelectOption>
        ))}
      </IonSelect>

      {/* Place / Room */}
      <IonSelect
        placeholder='Place/Room'
        disabled={!details.floor}
        value={details.place}
        onIonChange={e =>
          setDetails(prev => ({
            ...prev,
            place: e.detail.value
          }))
        }
      >
        {placeOptions.map((p: string) => (
          <IonSelectOption key={p} value={p}>
            {p}
          </IonSelectOption>
        ))}
      </IonSelect>
    </div>
  )
}

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
  const [details, setDetails] = useState({
    building: '',
    floor: '',
    place: ''
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
      details,
      image: image ? image.name : null
    }
    console.log(image?.name)
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

        <ItemStatusSelector value={status} onChange={setStatus} />
        <LastSeenModal
          date={toISODate(date, time, meridian)}
          handleDateChange={handleDateChange}
        />
        <LocationDetailsSelector details={details} setDetails={setDetails} />

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
