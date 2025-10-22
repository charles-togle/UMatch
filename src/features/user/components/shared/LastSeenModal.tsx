import { useRef } from 'react'
import {
  IonDatetimeButton,
  IonModal,
  IonDatetime,
  IonButtons,
  IonButton
} from '@ionic/react'
import './styles/lastSeenModal.css'

interface LastSeenModalProps {
  date?: string
  handleDateChange: (e: CustomEvent) => void
  isRequired?: boolean
}

const LastSeenModal: React.FC<LastSeenModalProps> = ({
  date,
  handleDateChange,
  isRequired = false
}) => {
  const datetime = useRef<null | HTMLIonDatetimeElement>(null)
  const modalRef = useRef<null | HTMLIonModalElement>(null)
  const reset = () => {
    datetime.current?.reset()
    modalRef.current?.dismiss()
  }
  const cancel = () => {
    datetime.current?.cancel()
    modalRef.current?.dismiss()
  }
  const confirm = () => {
    datetime.current?.confirm()
    modalRef.current?.dismiss()
  }

  return (
    <div className='mb-4'>
      <p className='font-default-font text-xl mb-2 text-slate-900 font-extrabold flex items-center'>
        Last Seen
        {isRequired && (
          <span className='text-umak-red font-default-font text-sm font-normal ml-3'>
            (required)
          </span>
        )}
      </p>
      <div className='flex flex-col space-x-3'>
        {/* Date & Time Picker */}
        <div className='flex flex-row justify-start space-x-5 items-center'>
          <IonDatetimeButton datetime='datetime' />
          <IonModal keepContentsMounted={true} ref={modalRef}>
            <IonDatetime
              id='datetime'
              presentation='date-time'
              value={date}
              onIonChange={handleDateChange}
              ref={datetime}
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
            >
              <IonButtons slot='buttons'>
                <IonButton color='danger' onClick={reset}>
                  Reset
                </IonButton>
                <IonButton color='primary' onClick={cancel}>
                  Never mind
                </IonButton>
                <IonButton color='primary' onClick={confirm}>
                  All Set
                </IonButton>
              </IonButtons>
            </IonDatetime>
          </IonModal>
        </div>
      </div>
    </div>
  )
}

export default LastSeenModal
