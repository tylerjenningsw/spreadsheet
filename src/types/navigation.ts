/**
 * Represents the possible navigation directions in the spreadsheet
 */
export type NavigationDirection = 'up' | 'down' | 'left' | 'right' | 'tab'

/**
 * Type guard to check if a string is a valid navigation direction
 */
export function isNavigationDirection(value: string): value is NavigationDirection {
  return ['up', 'down', 'left', 'right', 'tab'].includes(value)
}

/**
 * Maps keyboard keys to navigation directions
 */
export const KeyToDirection: Record<string, NavigationDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Tab: 'tab'
} as const
