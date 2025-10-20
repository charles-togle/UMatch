import { useIonRouter } from '@ionic/react'

const replaceFromAuthRoutes = ['auth', 'preload']

export const useNavigation = () => {
  const router = useIonRouter()

  const navigate = (path: string, from?: string) => {
    if (replaceFromAuthRoutes.includes(from || '')) {
      router.push(path, 'none', 'replace')
    } else {
      router.push(path, 'none')
    }
  }

  return { navigate }
}
