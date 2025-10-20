import React, { useMemo } from 'react'
import { IonSelect, IonSelectOption } from '@ionic/react'
import { locationsData } from '@/features/user/configs/locationsData'
import type { BuildingData, FloorData } from '@/features/user/configs/locationsData'

interface LocationDetails {
  building: string
  floor: string
  place: string
}

interface LocationDetailsSelectorProps {
  details: LocationDetails
  setDetails: React.Dispatch<React.SetStateAction<LocationDetails>>
  className?: string
  isRequired?: boolean
}

const LocationDetailsSelector: React.FC<LocationDetailsSelectorProps> = ({
  details,
  setDetails,
  className = '',
  isRequired = false
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
      <p className='font-default-font text-xl mb-2 text-slate-900 font-extrabold flex items-center'>
        Details
        {isRequired && (
          <span className='text-umak-red font-default-font text-sm font-normal ml-3'>
            (required)
          </span>
        )}
      </p>
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

export default LocationDetailsSelector
