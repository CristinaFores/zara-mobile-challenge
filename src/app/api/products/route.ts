import { isAxiosError } from 'axios'
import { NextRequest, NextResponse } from 'next/server'

import { API_ENDPOINTS, PHONES_LIMIT } from '@/constants'
import apiClient from '@/services/apiClient'
import type { Phone } from '@/types'

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get('limit')) || PHONES_LIMIT
  try {
    const response = await apiClient.get<Phone[]>(API_ENDPOINTS.PRODUCTS, {
      params: { limit },
    })
    return NextResponse.json(response.data)
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
