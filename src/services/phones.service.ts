import { API_ENDPOINTS, PHONES_LIMIT } from '@/constants'
import type { Phone, PhoneDetail } from '@/types'

import apiClient from './apiClient'

/**
 * Fetches the catalog page (max {@link PHONES_LIMIT} phones).
 * When `search` is provided it is sent as a query param so the API filters server-side.
 */
export async function getPhones(search = ''): Promise<Phone[]> {
  const params = { limit: PHONES_LIMIT, ...(search && { search }) }
  const response = await apiClient.get<Phone[]>(API_ENDPOINTS.PRODUCTS, { params })
  // The API occasionally returns duplicate entries — deduplicate by id to keep
  // React keys unique and avoid rendering the same phone twice.
  return [...new Map(response.data.map((p) => [p.id, p])).values()]
}

/** Fetches the full detail of a single phone by its id. */
export async function getPhoneById(id: string): Promise<PhoneDetail> {
  const response = await apiClient.get<PhoneDetail>(`${API_ENDPOINTS.PRODUCTS}/${id}`)
  return response.data
}
