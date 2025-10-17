export const moduleCache = new Map<string, Promise<any>>()


export const routePreloads: Record<string, () => Promise<any>> = {
  '/user/home': () => import('@/pages/user/Catalog'),
  '/user/faqs': () => import('@/pages/user/FAQs'),
  '/user/settings': () => import('@/pages/shared/Settings'),
  '/user/history': () => import('@/pages/user/History'),
  '/user/search': () => import('@/pages/user/SearchItem')
}
