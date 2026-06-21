import { API_ENDPOINTS, PHONES_FETCH_LIMIT, PHONES_LIMIT } from '@/constants'
import type { Phone, PhoneDetail } from '@/types'

import appClient from './appClient'

export async function getPhones(): Promise<Phone[]> {
  const { data } = await appClient.get<Phone[]>(`/api${API_ENDPOINTS.PRODUCTS}`, {
    params: { limit: PHONES_FETCH_LIMIT },
  })
  return [...new Map(data.map((phone) => [phone.id, phone])).values()].slice(0, PHONES_LIMIT)
}

export async function getPhoneById(id: string): Promise<PhoneDetail> {
  const { data } = await appClient.get<PhoneDetail>(`/api${API_ENDPOINTS.PRODUCTS}/${id}`)
  return data
}
