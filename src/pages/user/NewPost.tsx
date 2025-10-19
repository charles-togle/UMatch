import { useState, useMemo, useRef } from 'react'
import {
  IonButton,
  IonIcon,
  IonModal,
  IonDatetime,
  IonDatetimeButton,
  IonButtons,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonText,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPage
} from '@ionic/react'
import { closeOutline, checkmarkOutline } from 'ionicons/icons'
import CustomRadioGroup from '@/components/shared/CustomRadioGroup'
import ImageUpload from '@/components/shared/ImageUpload'
import { locationsData } from '@/configs/locationsData'
import type { BuildingData, FloorData } from '@/configs/locationsData'

/** ---------- Helpers ---------- */
const toISODate = (date: string, time: string, meridian: 'AM' | 'PM') => {
  const [month, day, year] = date.split('/')
  let [hours, minutes] = time.split(':').map(Number)
  if (meridian === 'PM' && hours < 12) hours += 12
  if (meridian === 'AM' && hours === 12) hours = 0
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${String(
    hours
  ).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+08:00`
}

/** ---------- Component ---------- */
export default function NewPost () {
  // time defaults (PH time)
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const ph = new Date(utc + 8 * 3600000)
  let hh = ph.getHours()
  const mm = ph.getMinutes().toString().padStart(2, '0')
  const meridianInit = hh >= 12 ? 'PM' : 'AM'
  hh = hh % 12 || 12

  // state
  const [anonymous, setAnonymous] = useState<'no' | 'yes'>('no')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [status, setStatus] = useState<'lost' | 'found'>('lost')
  const [date, setDate] = useState(
    ph.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
  )
  const [time, setTime] = useState(`${hh}:${mm}`)
  const [meridian, setMeridian] = useState(meridianInit as 'AM' | 'PM')

  const [details, setDetails] = useState({
    building: '',
    floor: '',
    room: '',
    place: ''
  })

  const [image, setImage] = useState<File | null>(null)

  // dynamic select options
  const buildingOptions: string[] = locationsData.map(
    (b: BuildingData) => b.name
  )

  const floorOptions: string[] = useMemo(() => {
    const building = locationsData.find(
      (b: BuildingData) => b.name === details.building
    )
    return building ? building.floors.map((f: FloorData) => f.name) : []
  }, [details.building])

  const placeOptions: string[] = useMemo(() => {
    const building = locationsData.find(
      (b: BuildingData) => b.name === details.building
    )
    const floor = building?.floors.find(
      (f: FloorData) => f.name === details.floor
    )
    const subPlaces: string[] = floor ? floor.subPlaces : []
    return subPlaces.length ? subPlaces : ['Not Applicable']
  }, [details.building, details.floor])

  // datetime modal refs & handlers
  const datetime = useRef<null | HTMLIonDatetimeElement>(null)
  const modalRef = useRef<null | HTMLIonModalElement>(null)

  const handleDateChange = (e: CustomEvent) => {
    const iso = e.detail.value as string
    if (!iso) return
    const d = new Date(iso)
    const formattedDate = d.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Manila'
    })
    let hours = d.getHours()
    const mins = d.getMinutes().toString().padStart(2, '0')
    const mer = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    setDate(formattedDate)
    setTime(`${hours}:${mins}`)
    setMeridian(mer as 'AM' | 'PM')
  }

  const onSubmit = () => {
    // Basic required validation
    if (!title.trim() || !desc.trim() || !image) return
    const payload = {
      anonymous,
      item: { title, desc, status },
      lastSeenISO: toISODate(date, time, meridian),
      details,
      imageName: image.name
    }
    console.log('Submitting New Post:', payload)
    // TODO: send to API
  }

  return (
    <IonPage>
      {/* Header like screenshot */}
      <IonHeader className='shadow-none'>
        <IonToolbar className='bg-umak-blue text-white rounded-b-md'>
          <div className='flex items-center justify-between px-3 py-2'>
            <IonButton
              fill='solid'
              color='danger'
              className='rounded-md h-8 px-3 text-xs font-semibold'
            >
              <IonIcon icon={closeOutline} slot='start' />
              CANCEL
            </IonButton>

            <IonTitle className='text-base font-default-font font-semibold text-white m-0'>
              New Post
            </IonTitle>

            <IonButton
              fill='solid'
              className='rounded-md h-8 px-3 text-xs font-semibold'
              style={
                {
                  ['--background']: 'var(--color-umak-blue, #1D2981)'
                } as React.CSSProperties
              }
              onClick={onSubmit}
            >
              <IonIcon icon={checkmarkOutline} slot='start' />
              POST
            </IonButton>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className='bg-gray-50'>
        {/* Card */}
        <div className='mx-3 my-3 rounded-xl shadow-md p-4 border border-gray-200 bg-white'>
          {/* Section: title row */}
          <div className='flex items-center space-x-2 mb-3'>
            <IonText className='font-default-font text-umak-blue text-lg font-semibold'>
              New Post
            </IonText>
          </div>

          <div className='h-px w-full bg-gray-300 my-3' />

          {/* Upload as Anonymous */}
          <div className='mb-3'>
            <div className='flex items-center gap-2'>
              <IonText className='font-default-font text-umak-blue font-semibold'>
                Upload as Anonymous
              </IonText>
              <IonText className='text-[11px] text-red-500'>
                (Available for item reporter)
              </IonText>
            </div>
            <div className='mt-2 w-2/3'>
              <CustomRadioGroup
                label='Upload as Anonymous'
                value={anonymous}
                onChange={v => setAnonymous(v as 'no' | 'yes')}
                options={[
                  { label: 'No', value: 'no' },
                  { label: 'Yes', value: 'yes' }
                ]}
                direction='horizontal'
              />
            </div>
          </div>

          {/* Item Name / Title */}
          <div className='mb-3'>
            <label className='font-default-font text-umak-blue font-semibold'>
              Item Name / Title <span className='text-red-500'>(required)</span>
            </label>
            <IonInput
              value={title}
              maxlength={32}
              placeholder='Max 32 characters'
              onIonInput={e => setTitle((e.detail.value ?? '').toString())}
              className='mt-1 border border-gray-400 rounded-md px-2'
            />
          </div>

          {/* Description */}
          <div className='mb-3'>
            <label className='font-default-font text-umak-blue font-semibold'>
              Description <span className='text-red-500'>(required)</span>
            </label>
            <IonTextarea
              value={desc}
              maxlength={150}
              placeholder='Max 150 characters'
              autoGrow
              onIonInput={e => setDesc((e.detail.value ?? '').toString())}
              className='mt-1 border border-gray-400 rounded-md px-2'
            />
          </div>

          {/* Item Status */}
          <div className='mb-3'>
            <div className='font-default-font text-umak-blue font-semibold'>
              Item Status <span className='text-red-500'>(required)</span>
            </div>
            <div className='mt-1'>
              <CustomRadioGroup
                label='Item Status'
                value={status}
                onChange={v => setStatus(v as 'lost' | 'found')}
                options={[
                  { label: 'Lost (Looking for)', value: 'lost' },
                  { label: 'Found (Surrendered)', value: 'found' }
                ]}
                direction='horizontal'
              />
            </div>
          </div>

          {/* Last Seen */}
          <div className='mb-3'>
            <div className='font-default-font text-umak-blue font-semibold'>
              Last Seen <span className='text-red-500'>(required)</span>
            </div>
            <div className='flex items-center gap-4 mt-2'>
              <IonDatetimeButton datetime='newpost-datetime' />
              <IonModal keepContentsMounted ref={modalRef}>
                <IonDatetime
                  id='newpost-datetime'
                  presentation='date-time'
                  value={toISODate(date, time, meridian)}
                  onIonChange={handleDateChange}
                  ref={datetime}
                  formatOptions={{
                    date: { month: 'short', day: '2-digit', year: 'numeric' },
                    time: { hour: '2-digit', minute: '2-digit' }
                  }}
                >
                  <IonButtons slot='buttons'>
                    <IonButton
                      color='danger'
                      onClick={() => {
                        datetime.current?.reset()
                        modalRef.current?.dismiss()
                      }}
                    >
                      Reset
                    </IonButton>
                    <IonButton
                      onClick={() => {
                        datetime.current?.cancel()
                        modalRef.current?.dismiss()
                      }}
                    >
                      Never mind
                    </IonButton>
                    <IonButton
                      onClick={() => {
                        datetime.current?.confirm()
                        modalRef.current?.dismiss()
                      }}
                    >
                      All Set
                    </IonButton>
                  </IonButtons>
                </IonDatetime>
              </IonModal>
            </div>
          </div>

          {/* Details */}
          <div className='mb-3'>
            <div className='font-default-font text-umak-blue font-semibold'>
              Details <span className='text-red-500'>(required)</span>
            </div>

            {/* Building/Area */}
            <IonSelect
              placeholder='Building/Area'
              value={details.building}
              onIonChange={e =>
                setDetails(prev => ({
                  ...prev,
                  building: e.detail.value,
                  floor: '',
                  room: '',
                  place: ''
                }))
              }
              className='mt-2 border border-gray-400 rounded-md'
            >
              {buildingOptions.map(b => (
                <IonSelectOption key={b} value={b}>
                  {b}
                </IonSelectOption>
              ))}
            </IonSelect>

            {/* Floor */}
            <IonSelect
              placeholder='Floor'
              disabled={!details.building}
              value={details.floor}
              onIonChange={e =>
                setDetails(prev => ({
                  ...prev,
                  floor: e.detail.value,
                  room: '',
                  place: ''
                }))
              }
              className='mt-2 border border-gray-400 rounded-md'
            >
              {floorOptions.map(f => (
                <IonSelectOption key={f} value={f}>
                  {f}
                </IonSelectOption>
              ))}
            </IonSelect>

            {/* Room (reuse place options if you don’t have a separate room dataset) */}
            <IonSelect
              placeholder='Room'
              disabled={!details.floor}
              value={details.room}
              onIonChange={e =>
                setDetails(prev => ({ ...prev, room: e.detail.value }))
              }
              className='mt-2 border border-gray-400 rounded-md'
            >
              {placeOptions.map(p => (
                <IonSelectOption key={`room-${p}`} value={p}>
                  {p}
                </IonSelectOption>
              ))}
            </IonSelect>

            {/* Place */}
            <IonSelect
              placeholder='Place'
              disabled={!details.floor}
              value={details.place}
              onIonChange={e =>
                setDetails(prev => ({ ...prev, place: e.detail.value }))
              }
              className='mt-2 border border-gray-400 rounded-md'
            >
              {placeOptions.map(p => (
                <IonSelectOption key={`place-${p}`} value={p}>
                  {p}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          {/* Image */}
          <div className='mb-3'>
            <div className='font-default-font text-umak-blue font-semibold mb-2'>
              Image <span className='text-red-500'>(required)</span>
            </div>
            <ImageUpload
              label='Upload Image'
              image={image}
              onImageChange={setImage}
            />
          </div>

          {/* POST button */}
          <IonButton
            expand='block'
            className='text-white font-default-font rounded-md'
            disabled={!title.trim() || !desc.trim() || !image}
            onClick={onSubmit}
            style={
              {
                ['--background']: 'var(--color-umak-blue, #1D2981)'
              } as React.CSSProperties
            }
          >
            POST
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  )
}
