/**
 * Post Categories Configuration
 * Each category has a type and associated color for UI consistency
 */

export interface CategoryConfig {
  type: string
  color: string
  icon?: string // Optional: can add ionicons icon names later
}

export const POST_CATEGORIES: CategoryConfig[] = [
  {
    type: 'Electronics',
    color: '#3B82F6' // Blue
  },
  {
    type: 'Accessories',
    color: '#8B5CF6' // Purple
  },
  {
    type: 'Documents',
    color: '#10B981' // Green
  },
  {
    type: 'Books & Notebooks',
    color: '#EC4899' // Pink
  },
  {
    type: 'Bags',
    color: '#6366F1' // Indigo
  },
  {
    type: 'Wallets & Cards',
    color: '#14B8A6' // Teal
  },
  {
    type: 'Keys',
    color: '#EF4444' // Red
  },
  {
    type: 'Clothing',
    color: '#F59E0B' // Amber
  },
  {
    type: 'Eyewear',
    color: '#A855F7' // Violet
  },
  {
    type: 'School Supplies',
    color: '#84CC16' // Lime
  },
  {
    type: 'Sports Equipment',
    color: '#06B6D4' // Cyan
  },
  {
    type: 'Water Bottles',
    color: '#22C55E' // Emerald
  },
  {
    type: 'Umbrellas',
    color: '#0EA5E9' // Sky Blue
  },
  {
    type: 'Medical Items',
    color: '#F472B6' // Rose
  },
  {
    type: 'Other',
    color: '#64748B' // Slate
  }
]

/**
 * Helper function to get category color by type
 * @param type - The category type
 * @returns The hex color code or default gray
 */
export function getCategoryColor (type: string): string {
  const category = POST_CATEGORIES.find(cat => cat.type === type)
  return category?.color || '#64748B'
}

/**
 * Helper function to get all category types as string array
 * Useful for form dropdowns and validation
 * @returns Array of category type strings
 */
export function getCategoryTypes (): string[] {
  return POST_CATEGORIES.map(cat => cat.type)
}

/**
 * Helper function to check if a category type is valid
 * @param type - The category type to validate
 * @returns True if valid, false otherwise
 */
export function isValidCategory (type: string): boolean {
  return POST_CATEGORIES.some(cat => cat.type === type)
}

/**
 * Helper function to get category config by type
 * @param type - The category type
 * @returns Category config or undefined
 */
export function getCategoryConfig (type: string): CategoryConfig | undefined {
  return POST_CATEGORIES.find(cat => cat.type === type)
}
