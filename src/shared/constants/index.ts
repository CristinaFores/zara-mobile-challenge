export const API_ENDPOINTS = {
  PRODUCTS: '/products',
} as const

export const ROUTES = {
  HOME: '/',
  PRODUCT_DETAIL: '/products',
  CART: '/cart',
} as const

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const PRODUCTS_LIMIT = 20
export const PRODUCTS_FETCH_LIMIT = 21

export const SEARCH_DEBOUNCE_MS = 300
export const FILTER_DEBOUNCE_MS = 450

export const CART_KEY = 'CART'
