import { useCallback, useState, useRef, useMemo } from 'react'
import SearchHistory from '@/features/user/components/search-item/SearchHistory'
import Header from '@/shared/components/Header'
import AdvancedSearch from '@/features/user/components/search-item/AdvancedSearch'
import { IonSearchbar, IonContent, IonButton } from '@ionic/react'
import { Keyboard } from '@capacitor/keyboard'
import { useNavigation } from '@/shared/hooks/useNavigation'
export default function SearchItem () {
  const [searchHistory, setSearchHistory] = useState<string[]>([
    'HPSB',
    'Oval',
    'Tumbler',
    'Red bleachers',
    'Item'
  ])
  const [searchValue, setSearchValue] = useState('')
  const searchRef = useRef<HTMLIonSearchbarElement | null>(null)
  const { navigate } = useNavigation()

  // 🔍 Filter logic
  const filteredHistory = useMemo(() => {
    if (!searchValue.trim()) return searchHistory
    const matches = searchHistory.filter(item =>
      item.toLowerCase().includes(searchValue.toLowerCase())
    )
    // If no matches, return an artificial "No Result Found" entry
    return matches.length > 0 ? matches : ['No Result Found']
  }, [searchHistory, searchValue])

  const handleCancel = useCallback(() => {
    setSearchValue('')
    if (!searchRef.current) return
    Keyboard.hide()
    navigate('/user/home', 'auth')
  }, [navigate])

  const handleSearchbarFocus = useCallback(() => {
    if (!searchRef.current) return
    try {
      searchRef.current.setFocus()
    } catch {
      const input = searchRef.current.querySelector('input')
      input?.focus()
    }
    Keyboard.show()
  }, [])

  const handleInput = (e: CustomEvent) => {
    setSearchValue(e.detail.value!)
  }

  return (
    <IonContent>
      <div className='fixed top-0 w-full z-999'>
        <Header logoShown={false}>
          <div className='flex items-center bg-[#1e2b87]'>
            <IonSearchbar
              ref={searchRef}
              placeholder='Search'
              value={searchValue}
              onIonInput={handleInput}
              onIonFocus={handleSearchbarFocus}
              style={
                {
                  ['--border-radius']: '0.5rem'
                } as React.CSSProperties
              }
            />
            <IonButton
              fill='clear'
              color='light'
              className='ml-2 text-sm font-medium'
              onClick={handleCancel}
            >
              CANCEL
            </IonButton>
          </div>
        </Header>
      </div>
      <div className='mt-14' />
      <SearchHistory
        searchHistory={filteredHistory}
        setSearchHistory={setSearchHistory}
      />
      <AdvancedSearch />
    </IonContent>
  )
}
