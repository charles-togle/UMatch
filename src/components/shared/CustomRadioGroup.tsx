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
}

export default function CustomRadioGroup ({
  label,
  value,
  options,
  onChange,
  direction = 'horizontal',
  className = ''
}: CustomRadioGroupProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <p className='font-default-font text-2xl font-semibold mb-2 text-black'>
        {label}
      </p>
      <div
        className={`flex ${
          direction === 'horizontal'
            ? 'flex-row justify-between'
            : 'flex-col space-y-2'
        }`}
      >
        {options.map(opt => (
          <label
            key={opt.value}
            className='flex justify-center cursor-pointer select-none'
          >
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
