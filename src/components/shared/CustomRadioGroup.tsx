interface Option {
  label: string
  value: string
}

interface CustomRadioGroupProps {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  className?: string
  direction?: 'horizontal' | 'vertical'
  isRequired?: boolean
}

export default function CustomRadioGroup ({
  label,
  value,
  options,
  onChange,
  direction = 'horizontal',
  className = '',
  isRequired = false
}: CustomRadioGroupProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <p className='font-default-font text-xl mb-2 text-slate-900 font-extrabold flex items-center'>
        {label}
        {isRequired && (
          <span className='text-umak-red font-default-font text-sm font-normal ml-3'>
            (required)
          </span>
        )}
      </p>
      <div
        className={`flex ${
          direction === 'horizontal'
            ? 'flex-col space-y-2 sm:flex-row sm:justify-between sm:gap-2 sm:space-y-0'
            : 'flex-col space-y-2'
        }`}
      >
        {options.map(opt => (
          <label key={opt.value} className='flex cursor-pointer select-none'>
            <input
              type='radio'
              className='appearance-none w-4 h-4 border border-gray-400 rounded-full checked:border-[5px] checked:border-[#1e2b87] transition-all'
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            <span className='text-md ml-2 text-gray-800'>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
