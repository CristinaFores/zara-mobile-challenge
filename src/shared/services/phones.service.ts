import { PHONES_FETCH_LIMIT, PHONES_LIMIT } from '@/shared/constants'
import type { Phone, PhoneDetail } from '@/shared/types'

import { fetchProductById, fetchProductList } from './products.api'

export async function getPhones(search?: string): Promise<Phone[]> {
  const phones = await fetchProductList({ limit: PHONES_FETCH_LIMIT, search })
  return phones.slice(0, PHONES_LIMIT)
}

export async function getPhoneById(id: string): Promise<PhoneDetail> {
  return fetchProductById(id)
}
