import CustomRadioGroup from '@/components/shared/CustomRadioGroup'

interface ItemStatusSelectorProps {
  value: 'lost' | 'found'
  onChange: (value: 'lost' | 'found') => void
  className?: string
  isRequired?: boolean
}

const ItemStatusSelector: React.FC<ItemStatusSelectorProps> = ({
  value,
  onChange,
  className = '',
  isRequired = false
}) => {
  return (
    <div className={`mb-4 ${className} font-default-font`}>
      <div className='w-auto'>
        <CustomRadioGroup
          label='Item Status'
          value={value}
          options={[
            { label: 'Lost (Looking for)', value: 'lost' },
            { label: 'Found (Surrendered)', value: 'found' }
          ]}
          onChange={val => onChange(val as 'lost' | 'found')}
          direction='horizontal'
          isRequired={isRequired}
        />
      </div>
    </div>
  )
}
export default ItemStatusSelector
