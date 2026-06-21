import { isAxiosError } from 'axios'
import { NextResponse } from 'next/server'

import { API_ENDPOINTS } from '@/constants'
import apiClient from '@/services/apiClient'
import type { PhoneDetail } from '@/types'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const response = await apiClient.get<PhoneDetail>(`${API_ENDPOINTS.PRODUCTS}/${id}`)
    return NextResponse.json(response.data)
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
