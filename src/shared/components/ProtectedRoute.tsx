// components/ProtectedRoute.tsx
import type { ReactNode } from 'react'
import { useIonRouter } from '@ionic/react'
import type { User } from '@/features/auth/contexts/UserContext'

export default function ProtectedRoute ({
  allowedRoles,
  children,
  user
}: {
  allowedRoles: string[]
  children: ReactNode
  user: User | null
}) {
  const router = useIonRouter()

  // if (!user) {
  //   router.push('/auth', 'forward', 'replace')
  //   return null
  // }

  // if (!allowedRoles.includes(user.user_type.toLowerCase())) {
  //   router.push('/unauthorized', 'forward', 'replace')
  //   return null
  // }

  return <>{children}</>
}
