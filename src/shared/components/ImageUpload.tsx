import React, { useRef } from 'react'
import { IonButton, IonIcon } from '@ionic/react'
import { cloudUploadOutline, refreshOutline } from 'ionicons/icons'

interface ImageUploadSectionProps {
  label?: string
  image: File | null
  onImageChange: (file: File | null) => void
  className?: string
  isRequired?: boolean
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  label = 'Reverse Image Search',
  image,
  onImageChange,
  className = '',
  isRequired = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageChange(e.target.files[0])
    }
  }

  const handleReplaceClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`mb-6 ${className}`}>
      <p className='font-default-font text-xl mb-2 text-slate-900 font-extrabold flex items-center'>
        {label}
        {isRequired && (
          <span className='text-umak-red font-default-font text-sm font-normal ml-2'>
            (required)
          </span>
        )}
      </p>
      <label
        className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32 cursor-pointer transition relative hover:bg-gray-50`}
      >
        {!image ? (
          <>
            <IonIcon
              icon={cloudUploadOutline}
              className='text-2xl mb-2 text-gray-400'
            />
            <p className='text-sm text-gray-500'>Upload Image (Max: 1 file)</p>
          </>
        ) : (
          <div className='flex flex-col items-center justify-center text-center'>
            <p className='font-default-font text-base font-regular mb-2 truncate w-48'>
              {image.name}
            </p>
            <IonButton
              type='button'
              onClick={handleReplaceClick}
              className='flex items-center gap-1 text-xs font-default-font hover:underline'
            >
              <IonIcon icon={refreshOutline} className='text-base mr-2' />
              Replace
            </IonButton>
          </div>
        )}

        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleUpload}
          hidden
        />
      </label>
    </div>
  )
}

export default ImageUploadSection
