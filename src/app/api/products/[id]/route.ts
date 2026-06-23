import { NextResponse } from 'next/server'

import { fetchProductById, productsErrorResponse } from '@/shared/services/products.api'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const product = await fetchProductById(id)
    return NextResponse.json(product)
  } catch (error) {
    return productsErrorResponse(error)
  }
}
