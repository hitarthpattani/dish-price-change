/*
 * <license header>
 */

import type { ActionCallHeaders } from '@components/MainPage/utils/NavigationProvider/types'

/**
 * Cache item structure returned from the backend
 */
export interface CacheItem {
  id: string
  key: string
  value: unknown
  expiration: string | number
}

/**
 * API response structure for cache list
 */
export interface CacheListResponse {
  keys: CacheItem[]
}

/**
 * Grid-formatted cache item for DataTable display
 */
export interface CacheGridItem {
  id: string
  key: string
  value: string
  expiration: string
}

/**
 * Props for ManageCaches component
 */
export interface ManageCachesProps {
  actionCallHeaders: ActionCallHeaders
}
