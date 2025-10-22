import { useMemo, useState } from 'react'
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonChip,
  IonButton,
  IonSearchbar
} from '@ionic/react'
import { POST_CATEGORIES } from '@/features/user/configs/postCategories'

interface CategorySelectionProps {
  isOpen: boolean
  selected: string | null
  onClose: () => void
  onSelect: (category: string) => void
}

// Bottom-sheet style category selector covering ~1/3 of the screen
export default function CategorySelection ({
  isOpen,
  onClose,
  onSelect
}: CategorySelectionProps) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return POST_CATEGORIES
    return POST_CATEGORIES.filter(c => c.type.toLowerCase().includes(term))
  }, [q])

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      initialBreakpoint={0.5}
      breakpoints={[0, 0.5, 0.5, 1]}
      backdropDismiss={true}
      className='category-selection-modal'
    >
      <IonHeader>
        <IonToolbar className='px-4'>
          <IonTitle>Select Category</IonTitle>
          <IonButton slot='end' onClick={onClose} color='medium'>
            Close
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
        <div className='text-sm text-gray-600 mb-3'>
          State which category the item belongs in.
        </div>
        <IonSearchbar
          debounce={0}
          onIonInput={e => setQ(e.detail.value || '')}
          placeholder='search'
          showClearButton='focus'
          style={
            {
              ['--border-radius']: '0.5rem'
            } as React.CSSProperties
          }
        />

        {/* Chips grid */}
        <div className='flex flex-wrap justify-center gap-2 mt-2'>
          {filtered.map(cat => {
            return (
              <IonChip
                key={cat.type}
                onClick={() => onSelect(cat.type)}
                className='py-1 px-5'
                style={
                  {
                    '--background': 'transparent',
                    '--color': 'var(--color-umak-blue)',
                    border: '2px solid var(--color-umak-blue)'
                  } as any
                }
              >
                {cat.type}
              </IonChip>
            )
          })}
        </div>
      </IonContent>
    </IonModal>
  )
}
