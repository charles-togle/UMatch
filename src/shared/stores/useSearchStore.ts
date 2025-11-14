import { create } from 'zustand'

interface SearchState {
  /**
   * Array of post IDs from search results
   */
  searchResultPostIds: string[]

  /**
   * Set search result post IDs
   */
  setSearchResults: (postIds: string[]) => void

  /**
   * Add a single post ID to search results
   */
  addSearchResult: (postId: string) => void

  /**
   * Remove a post ID from search results
   */
  removeSearchResult: (postId: string) => void

  /**
   * Clear all search results
   */
  clearSearchResults: () => void

  /**
   * Check if a post ID exists in search results
   */
  hasPostId: (postId: string) => boolean
}

/**
 * Global store for search results (array of post IDs)
 * Used to store and manage similar items found through search
 */
export const useSearchStore = create<SearchState>((set, get) => ({
  searchResultPostIds: [],

  setSearchResults: (postIds: string[]) => {
    set({ searchResultPostIds: postIds })
  },

  addSearchResult: (postId: string) => {
    set(state => ({
      searchResultPostIds: state.searchResultPostIds.includes(postId)
        ? state.searchResultPostIds
        : [...state.searchResultPostIds, postId]
    }))
  },

  removeSearchResult: (postId: string) => {
    set(state => ({
      searchResultPostIds: state.searchResultPostIds.filter(id => id !== postId)
    }))
  },

  clearSearchResults: () => {
    set({ searchResultPostIds: [] })
  },

  hasPostId: (postId: string) => {
    return get().searchResultPostIds.includes(postId)
  }
}))
