import { NextRequest, NextResponse } from 'next/server'

import { PHONES_LIMIT } from '@/shared/constants'
import { fetchProductList, productsErrorResponse } from '@/shared/services/products.api'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const limit = Number(searchParams.get('limit')) || PHONES_LIMIT
  const search = searchParams.get('search') ?? undefined

  try {
    const products = await fetchProductList({ limit, search })
    return NextResponse.json(products)
  } catch (error) {
    return productsErrorResponse(error)
  }
}
