import { isAxiosError } from 'axios'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { HTTP_STATUS } from '@/constants'
import { getPhoneById } from '@/services/phones.service'
import type { PhoneDetail } from '@/types'

function isNotFoundError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === HTTP_STATUS.NOT_FOUND
}

export const loadPhoneDetail = cache(async (id: string): Promise<PhoneDetail> => {
  try {
    return await getPhoneById(id)
  } catch (error) {
    if (isNotFoundError(error)) notFound()
    throw error
  }
})

export function buildPhoneDetailMetadata(phone: PhoneDetail): Metadata {
  return {
    title: `${phone.name} - ${phone.brand}`,
    description: phone.description,
  }
}
