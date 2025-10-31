import { useState, useRef } from 'react'
import { IonContent, IonIcon, IonButton, IonSpinner } from '@ionic/react'
import ImageUpload from '@/shared/components/ImageUpload'
import FormSectionHeader from '@/shared/components/FormSectionHeader'
import ActionModal from '@/shared/components/ActionModal'
import LocationDetailsSelector from '@/features/user/components/shared/LocationDetailsSelector'
import LastSeenModal from '@/features/user/components/shared/LastSeenModal'
import ItemStatusSelector from '@/features/user/components/shared/ItemStatusSelector'
import Header from '@/shared/components/Header'
import {
  create,
  informationCircle,
  backspace,
  checkmarkCircle
} from 'ionicons/icons'
import { useNavigation } from '@/shared/hooks/useNavigation'
import { IonToast } from '@ionic/react'
import { usePost } from '../hooks/usePost'
import CategorySelection from '@/features/user/components/shared/CategorySelection'
import CategorySelectionTrigger from '@/features/user/components/shared/CategorySelectionTrigger'
import TextArea from '@/shared/components/TextArea'
import { Network } from '@capacitor/network'

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
  const [errorMessage, setErrorMessage] = useState('') // for error message
  const [showToast, setShowToast] = useState(false)
  const [toastColor, setToastColor] = useState<'danger' | 'success'>('danger')
  const [anonymous, setAnonymous] = useState<'no' | 'yes'>('no')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [type, setType] = useState<'missing' | 'found'>('found')
  const [date, setDate] = useState(
    ph.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
  )
  const [time, setTime] = useState(`${hh}:${mm}`)
  const [meridian, setMeridian] = useState(meridianInit as 'AM' | 'PM')
  const [image, setImage] = useState<File | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [showCategorySheet, setShowCategorySheet] = useState(false)
  const [locationDetails, setLocationDetails] = useState({
    level1: '',
    level2: '',
    level3: ''
  })
  const [loading, setLoading] = useState(false)
  const { navigate } = useNavigation()
  const { createPost } = usePost()
  const [showFinalizeModal, setShowFinalizeModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const handleCancel = () => {
    navigate('/user/home')
  }

  const handleSubmit = async () => {
    // Clear any existing timeout (debounce)
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current)
    }

    // Debounce the submit action
    submitTimeoutRef.current = setTimeout(async () => {
      if (loading) return

      setLoading(true)

      // Trim text inputs
      const titleTrimmed = title.trim()
      const descTrimmed = desc.trim()

      // Validate required fields
      if (
        !titleTrimmed ||
        !descTrimmed ||
        !image ||
        !category ||
        !locationDetails.level1.trim() ||
        !locationDetails.level2.trim() ||
        !locationDetails.level3.trim() ||
        !type ||
        !date ||
        !time ||
        !meridian
      ) {
        setErrorMessage('Please fill in all required fields.')
        setToastColor('danger')
        setShowToast(true)
        setLoading(false)
        return
      }

      // Check network connectivity
      const status = await Network.getStatus()
      if (status.connected === false) {
        setErrorMessage('You are not connected to the internet')
        setToastColor('danger')
        setShowToast(true)
        setLoading(false)
        return
      }

      const payload = {
        anonymous: anonymous === 'yes',
        item: {
          title: titleTrimmed,
          desc: descTrimmed,
          type
        },
        category: category as any,
        lastSeenISO: toISODate(date, time, meridian),
        locationDetails: {
          level1: locationDetails.level1.trim(),
          level2: locationDetails.level2.trim(),
          level3: locationDetails.level3.trim()
        },
        imageName: image.name,
        image: image
      }

      console.log('Submitting New Post:', payload)

      try {
        const result = await createPost(payload)

        if (result.error) {
          setErrorMessage(result.error)
          setToastColor('danger')
          setShowToast(true)
          setLoading(false)
          return
        }

        // Success
        setErrorMessage('Post created successfully!')
        setToastColor('success')
        setShowToast(true)
        setLoading(false)

        // Navigate after a brief delay to show the toast
        setTimeout(() => {
          navigate('/user/home')
        }, 1000)
      } catch (error) {
        console.error('Error creating post:', error)
        setErrorMessage('Failed to create post')
        setToastColor('danger')
        setShowToast(true)
        setLoading(false)
      }
    }, 300) // 300ms debounce
  }

  return (
    <IonContent>
      <div className='fixed top-0 w-full z-999'>
        <Header logoShown={false} isProfileAndNotificationShown={false}>
          <div className='flex justify-between items-center bg-[#1e2b87] ion-padding-start ion-padding-end'>
            <IonButton
              style={{
                '--background': 'var(--color-umak-red)',
                '--box-shadow': 'none'
              }}
              onClick={() => setShowCancelModal(true)}
            >
              Cancel
            </IonButton>
            <div className='flex items-center space-x-2 w-fit h-fit border-1 border-white rounded-md'>
              <IonButton
                style={{
                  '--background': 'transparent',
                  '--box-shadow': 'none'
                }}
                onClick={() => setShowFinalizeModal(true)}
                disabled={loading}
              >
                {loading ? <IonSpinner name='crescent' /> : 'Submit'}
              </IonButton>
            </div>
          </div>
        </Header>
      </div>
      <div className=' bg-gray-50 mb-5 w-full mt-14 font-default-font'>
        <div className='mt-3 shadow-md p-4 border border-gray-200'>
          <div className='flex items-center space-x-2'>
            <IonIcon
              icon={create}
              className='text-[#1e2b87]'
              style={{ fontSize: '32px', ['--ionicon-stroke-width']: '40px' }}
            />
            <div className='text-umak-blue font-default-font text-base font-normal'>
              New Post
            </div>
          </div>
          <div className='w-full h-px bg-slate-900 my-3' />
          <div>
            {/* ANONYMOUS RADIO */}
            <div className='mb-4'>
              <FormSectionHeader
                header={
                  <>
                    <span>Upload as anonymous?</span>
                    <span className='text-umak-red font-default-font text-sm font-normal ml-3'>
                      (for reporters only)
                    </span>
                  </>
                }
              />
              <div className='flex flex-row justify-start gap-10'>
                <label className='flex justify-center cursor-pointer select-none'>
                  <input
                    type='radio'
                    className='appearance-none w-4 h-4 border border-gray-400 rounded-full checked:border-[5px] checked:border-[#1e2b87] transition-all'
                    checked={anonymous === 'no'}
                    onChange={() => setAnonymous('no')}
                  />
                  <span className='text-md ml-2 text-gray-800'>No</span>
                </label>
                <label className='flex justify-center cursor-pointer select-none'>
                  <input
                    type='radio'
                    className='appearance-none w-4 h-4 border border-gray-400 rounded-full checked:border-[5px] checked:border-[#1e2b87] transition-all'
                    checked={anonymous === 'yes'}
                    onChange={() => setAnonymous('yes')}
                  />
                  <span className='text-md ml-2 text-gray-800'>Yes</span>
                </label>
              </div>
            </div>
            {/* ITEM NAME */}
            <div className='mb-4'>
              <FormSectionHeader header='Item Name/Title' isRequired />
              <input
                type='text'
                className='border-2 border-black rounded-xs py-1 px-2 w-full focus:border-2-umak-blue focus:outline-none font-default-font text-base'
                value={title}
                placeholder='Max 32 characters'
                maxLength={32}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className='mb-4'>
              <FormSectionHeader header='Description' />
              <TextArea
                value={desc}
                setValue={setDesc}
                maxLength={150}
                placeholder='Provide additional details about the item (e.g., color, brand, unique features). Max 150 characters.'
              />
            </div>
            <div className='pr-5'>
              <ItemStatusSelector
                value={type}
                onChange={value => setType(value as 'missing' | 'found')}
                isRequired={true}
              />
            </div>
            <LastSeenModal
              handleDateChange={handleDateChange}
              date={toISODate(date, time, meridian)}
              isRequired={true}
            />
            <div className='mb-4'>
              <FormSectionHeader header='Category' isRequired />
              <div>
                <CategorySelectionTrigger
                  category={category}
                  onOpenSelector={() => setShowCategorySheet(true)}
                  onClear={() => setCategory(null)}
                />
              </div>
            </div>
            <LocationDetailsSelector
              locationDetails={locationDetails}
              setLocationDetails={setLocationDetails}
              isRequired={true}
            />
            <ImageUpload
              label='Image'
              image={image}
              onImageChange={setImage}
              isRequired={true}
            />
            <div className='rounded-md overflow-hidden'>
              <IonButton
                style={{ '--background': 'var(--color-umak-blue)' }}
                expand='full'
                onClick={() => setShowFinalizeModal(true)}
                disabled={loading}
              >
                {loading ? <IonSpinner name='crescent' /> : 'Submit'}
              </IonButton>
            </div>
          </div>
        </div>
      </div>

      {/* Finalize Submit Modal */}
      <ActionModal
        isOpen={showFinalizeModal}
        onDidDismiss={() => setShowFinalizeModal(false)}
        header={
          <div className='flex flex-col items-center'>
            <IonIcon
              icon={informationCircle}
              className='text-3xl text-umak-blue'
            />
            <div className='mt-2 text-base font-semibold'>
              Finalize and submit report?
            </div>
          </div>
        }
        actions={[
          {
            text: 'Continue editing',
            onClick: close => {
              close()
              setShowFinalizeModal(false)
            },
            icon: create,
            iconColor: 'text-amber-500'
          },
          {
            text: 'Upload report',
            onClick: close => {
              close()
              setShowFinalizeModal(false)
              void handleSubmit()
            },
            icon: checkmarkCircle,
            iconColor: 'text-lime-500'
          }
        ]}
      />

      {/* Cancel Confirmation Modal */}
      <ActionModal
        isOpen={showCancelModal}
        onDidDismiss={() => setShowCancelModal(false)}
        header={
          <div className='flex flex-col items-center'>
            <IonIcon
              icon={informationCircle}
              className='text-3xl text-umak-blue'
            />
            <div className='mt-2 text-base font-normal'>
              Are you sure you want to cancel?
            </div>
          </div>
        }
        actions={[
          {
            text: 'Cancel report',
            onClick: close => {
              close()
              setShowCancelModal(false)
              handleCancel()
            },
            icon: backspace,
            iconColor: 'text-umak-red'
          },
          {
            text: 'Continue writing',
            onClick: close => {
              close()
              setShowCancelModal(false)
            },
            icon: create,
            iconColor: 'text-lime-600'
          }
        ]}
      />
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={errorMessage}
        duration={2000}
        color={toastColor}
        position='bottom'
      />
      <CategorySelection
        isOpen={showCategorySheet}
        selected={category}
        onClose={() => setShowCategorySheet(false)}
        onSelect={c => {
          setCategory(c)
          setShowCategorySheet(false)
        }}
      />
    </IonContent>
  )
}
