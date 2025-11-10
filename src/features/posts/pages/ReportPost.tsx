import {
  IonCard,
  IonCardContent,
  IonButton,
  IonContent,
  IonSpinner,
  IonToast
} from '@ionic/react'
import CardHeader from '@/shared/components/CardHeader'
import { informationCircle } from 'ionicons/icons'
import { useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { getPost } from '../data/posts'
import type { PublicPost } from '../types/post'
import { useEffect, useState, useRef } from 'react'
import ReportContents from '../components/ReportContents'
import ReportPostSkeleton from '../components/ReportPostSkeleton'
import Header from '@/shared/components/Header'
import { usePostActions } from '@/features/user/hooks/usePostActions'
import { Network } from '@capacitor/network'
import { useNavigation } from '@/shared/hooks/useNavigation'
import useNotifications from '@/features/user/hooks/useNotifications'
import { useUser } from '@/features/auth/contexts/UserContext'

export default function ReportPost () {
  const [post, setPost] = useState<PublicPost | null | undefined>(undefined)
  const [concern, setConcern] = useState<string>('')
  const [additionalDetails, setAdditionalDetails] = useState<string>('')
  const [image, setImage] = useState<File | null>(null)
  const [customConcernText, setCustomConcernText] = useState('')
  const [reviewed, setReviewed] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastColor, setToastColor] = useState<'danger' | 'success'>('danger')
  const { reportPost } = usePostActions()
  const { getUser } = useUser()
  const { sendNotification } = useNotifications()
  const { postId } = useParams<{ postId: string }>()
  const { navigate } = useNavigation()
  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const getCurrentPost = async () => {
      if (!postId) return

      const fetchedPost = await getPost(postId as string)
      setPost(fetchedPost)
      // loading handled implicitly by checking post state
    }
    getCurrentPost()
  }, [postId])

  if (post === null) {
    return <div>No post found.</div>
  }

  const handleSubmitReport = async () => {
    // Clear any existing timeout (debounce)
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current)
    }

    // Debounce the submit action
    submitTimeoutRef.current = setTimeout(async () => {
      if (!postId || submitting) return

      // Validate required fields
      if (!concern || (concern === 'Others' && !customConcernText.trim())) {
        setToastMessage('Please select a concern')
        setToastColor('danger')
        setShowToast(true)
        return
      }

      if (!reviewed) {
        setToastMessage('Please review and confirm the details')
        setToastColor('danger')
        setShowToast(true)
        return
      }

      // Check network connectivity
      const status = await Network.getStatus()
      if (status.connected === false) {
        setToastMessage('You are not connected to the internet')
        setToastColor('danger')
        setShowToast(true)
        return
      }

      setSubmitting(true)

      try {
        const user = await getUser()
        if (!user) {
          setToastMessage('User not authenticated')
          setToastColor('danger')
          setShowToast(true)
          setSubmitting(false)
          return
        }

        const result = await reportPost({
          postId,
          concern: concern === 'Others' ? customConcernText : concern,
          additionalDetails,
          proofImage: image
        })

        if (result.error) {
          setToastMessage(result.error)
          setToastColor('danger')
          setShowToast(true)
          setSubmitting(false)
          return
        }

        // Send notification to self
        sendNotification({
          title: 'Report Submitted',
          message: `Greetings! Your report for post "${post?.item_name}" has been submitted successfully. Thank you for helping us keep the community safe.`,
          type: 'progress',
          userId: user.user_id
        })
        // Success
        setToastMessage('Report submitted successfully!')
        setToastColor('success')
        setShowToast(true)

        // Navigate after a brief delay
        setTimeout(() => {
          navigate('/user/home')
        }, 1500)
      } catch (error) {
        console.error('Error submitting report:', error)
        setToastMessage('Failed to submit report')
        setToastColor('danger')
        setShowToast(true)
        setSubmitting(false)
      }
    }, 300) // 300ms debounce
  }

  return (
    <IonContent>
      {post === undefined ? (
        <ReportPostSkeleton />
      ) : (
        <>
          <Header logoShown isProfileAndNotificationShown />
          <IonCard>
            <IonCardContent>
              <CardHeader
                title='Fraud Report'
                icon={informationCircle}
              ></CardHeader>
              <PostCard
                imgUrl={post?.item_image_url ?? ''}
                title={post?.item_name ?? ''}
                description={post?.item_description ?? ''}
                owner={post?.is_anonymous ? 'Anonymous' : post?.username ?? ''}
              />
              <ReportContents
                additionalDetails={additionalDetails}
                concern={concern}
                image={image}
                setAdditionalDetails={setAdditionalDetails}
                setConcern={setConcern}
                setImage={setImage}
                customConcernText={customConcernText}
                setCustomConcernText={setCustomConcernText}
                reviewed={reviewed}
                setReviewed={setReviewed}
              />
              <IonButton
                className='w-full'
                style={{
                  '--background': 'var(--color-umak-blue)'
                }}
                onClick={handleSubmitReport}
                disabled={submitting}
              >
                {submitting ? <IonSpinner name='crescent' /> : 'Submit'}
              </IonButton>
            </IonCardContent>
          </IonCard>

          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={3000}
            color={toastColor}
          />
        </>
      )}
    </IonContent>
  )
}
