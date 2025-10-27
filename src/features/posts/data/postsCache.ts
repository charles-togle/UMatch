import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import type { PublicPost } from '@/features/posts/types/post'

export type PostCacheKeys = {
  loadedKey: string
  cacheKey: string
}

const DEFAULT_KEYS: PostCacheKeys = {
  loadedKey: 'LoadedPosts',
  cacheKey: 'CachedPublicPosts'
}

// Hybrid storage: Preferences on native, localStorage on web
const storage = {
  async get (key: string): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key })
      return value ?? null
    }
    return localStorage.getItem(key)
  },
  async set (key: string, value: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key, value })
      return
    }
    localStorage.setItem(key, value)
  },
  async remove (key: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key })
      return
    }
    localStorage.removeItem(key)
  }
}

export async function loadLoadedPostIds (
  keys: PostCacheKeys = DEFAULT_KEYS
): Promise<Set<string>> {
  try {
    const raw = await storage.get(keys.loadedKey)
    if (!raw) return new Set()
    const arr: string[] = JSON.parse(raw)
    return new Set(arr)
  } catch {
    return new Set()
  }
}

export async function saveLoadedPostIds (
  ids: Set<string>,
  keys: PostCacheKeys = DEFAULT_KEYS
): Promise<void> {
  try {
    const arr = Array.from(ids)
    await storage.set(keys.loadedKey, JSON.stringify(arr))
  } catch {
    // no-op
  }
}

export async function loadCachedPublicPosts (
  keys: PostCacheKeys = DEFAULT_KEYS
): Promise<PublicPost[]> {
  try {
    const raw = await storage.get(keys.cacheKey)
    if (!raw) return []
    const arr: PublicPost[] = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export async function saveCachedPublicPosts (
  posts: PublicPost[],
  keys: PostCacheKeys = DEFAULT_KEYS
): Promise<void> {
  try {
    await storage.set(keys.cacheKey, JSON.stringify(posts))
  } catch {
    // no-op
  }
}

export async function addPostsToCache (
  newPosts: PublicPost[],
  keys: PostCacheKeys = DEFAULT_KEYS
): Promise<void> {
  const current = await loadCachedPublicPosts(keys)
  // Merge by post_id, keep first occurrence (assume newest first in newPosts)
  const byId = new Map<string, PublicPost>()
  for (const p of [...newPosts, ...current]) {
    byId.set(p.post_id, p)
  }
  const merged = Array.from(byId.values())
  await saveCachedPublicPosts(merged, keys)
}

export async function clearPostsCache (
  keys: PostCacheKeys = DEFAULT_KEYS
): Promise<void> {
  try {
    await storage.remove(keys.loadedKey)
    await storage.remove(keys.cacheKey)
  } catch {
    // no-op
  }
}

// Convenience factory to create a scoped cache instance with custom keys
export function createPostCache (customKeys: Partial<PostCacheKeys> = {}) {
  const keys: PostCacheKeys = {
    loadedKey: customKeys.loadedKey ?? DEFAULT_KEYS.loadedKey,
    cacheKey: customKeys.cacheKey ?? DEFAULT_KEYS.cacheKey
  }
  return {
    loadLoadedPostIds: () => loadLoadedPostIds(keys),
    saveLoadedPostIds: (ids: Set<string>) => saveLoadedPostIds(ids, keys),
    loadCachedPublicPosts: () => loadCachedPublicPosts(keys),
    saveCachedPublicPosts: (posts: PublicPost[]) =>
      saveCachedPublicPosts(posts, keys),
    addPostsToCache: (newPosts: PublicPost[]) =>
      addPostsToCache(newPosts, keys),
    clearPostsCache: () => clearPostsCache(keys)
  }
}
