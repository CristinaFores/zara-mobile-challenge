import { API_ENDPOINTS, PHONES_LIMIT } from '@/constants'
import type { Phone, PhoneDetail } from '@/types'

import apiClient from './apiClient'

/** Fetches the catalog page (max {@link PHONES_LIMIT} phones). */
export async function getPhones(): Promise<Phone[]> {
  const response = await apiClient.get<Phone[]>(API_ENDPOINTS.PRODUCTS, {
    params: { limit: PHONES_LIMIT },
  })
  // The API occasionally returns duplicate entries — deduplicate by id to keep
  // React keys unique and avoid rendering the same phone twice.
  return [...new Map(response.data.map((phone) => [phone.id, phone])).values()]
}

/** Fetches the full detail of a single phone by its id. */
export async function getPhoneById(id: string): Promise<PhoneDetail> {
  const response = await apiClient.get<PhoneDetail>(`${API_ENDPOINTS.PRODUCTS}/${id}`)
  return response.data
}
