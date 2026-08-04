/*
 * <license header>
 */

import type { CacheItem, CacheListResponse, CacheGridItem } from '../../types'

/**
 * Converts API response to array format suitable for DataTable
 *
 * @param {CacheListResponse | null | undefined} response - API response object containing cache items
 * @returns {CacheGridItem[]} Array of cache items formatted for DataTable
 */
export const toCachesArray = (response: CacheListResponse | null | undefined): CacheGridItem[] => {
  if (!response?.keys || !Array.isArray(response.keys)) {
    return []
  }

  return response.keys.map(
    (item: CacheItem): CacheGridItem => ({
      id: item.id,
      key: item.key,
      value: typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value || ''),
      expiration: formatExpirationDate(item.expiration)
    })
  )
}

/**
 * Truncates long text values for display in grid
 *
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text || text.length <= maxLength) {
    return text
  }
  return `${text.substring(0, maxLength)}...`
}

/**
 * Formats expiration date/time to a user-friendly format
 *
 * @param {string | number} expiration - Expiration timestamp or ISO date string
 * @returns {string} Formatted date string or 'N/A' if invalid
 */
export const formatExpirationDate = (expiration: string | number): string => {
  if (!expiration) return 'N/A'

  try {
    // Handle Unix timestamp (number or string of numbers)
    let date: Date
    if (typeof expiration === 'number' || /^\d+$/.test(expiration)) {
      const timestamp = typeof expiration === 'string' ? parseInt(expiration, 10) : expiration
      // Check if timestamp is in seconds (< year 3000) and convert to milliseconds
      date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp)
    } else {
      // Handle ISO date string
      date = new Date(expiration)
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'N/A'
    }

    // Format: "Dec 25, 2025, 10:30 AM"
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    console.error('Error formatting expiration date:', error)
    return 'N/A'
  }
}
