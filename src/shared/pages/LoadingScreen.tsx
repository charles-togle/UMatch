// LoadingScreen.tsx
export default function LoadingScreen () {
  return (
    <div
      className='h-screen w-screen flex items-center justify-center bg-[#0A4DAA]'
      role='status'
      aria-live='polite'
    >
      <span className='text-white font-semibold text-4xl animate-pulse'>
        Umatch
      </span>
    </div>
  )
}
