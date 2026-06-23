import type { Product, ProductDetail } from '@/shared/types'

export const productListFixture: Product[] = [
  {
    id: 'SMG-S24U',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    basePrice: 1329,
    imageUrl:
      'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U-titanium-violet.webp',
  },
  {
    id: 'APL-I15PM',
    brand: 'Apple',
    name: 'iPhone 15 Pro Max',
    basePrice: 1319,
    imageUrl:
      'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/APL-I15PM-titanio-negro.webp',
  },
  {
    id: 'GPX-8A',
    brand: 'Google',
    name: 'Pixel 8a',
    basePrice: 459,
    imageUrl: 'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/GPX-8A-obsidiana.webp',
  },
  {
    id: 'XMI-RN13P5G',
    brand: 'Xiaomi',
    name: 'Redmi Note 13 Pro 5G',
    basePrice: 399,
    imageUrl:
      'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/XMI-RN13P5G-midnight-black.webp',
  },
  {
    id: 'MTE-EDGE50PRO',
    brand: 'Motorola',
    name: 'edge 50 Pro',
    basePrice: 649,
    imageUrl:
      'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/MTE-EDGE50PRO-negro.webp',
  },
]

export const productDetailFixture: ProductDetail = {
  id: 'SMG-S24U',
  brand: 'Samsung',
  name: 'Galaxy S24 Ultra',
  description:
    'The Galaxy S24 Ultra redefines what a smartphone can do. Powered by the Snapdragon 8 Gen 3, it delivers unmatched performance, a built-in S Pen, and a stunning 6.8" Dynamic AMOLED display.',
  basePrice: 1329,
  rating: 4.9,
  specs: {
    screen: '6.8" Dynamic AMOLED 2X',
    resolution: '3088 x 1440 px (QHD+)',
    processor: 'Snapdragon 8 Gen 3',
    mainCamera: '200 MP + 12 MP + 10 MP + 50 MP',
    selfieCamera: '12 MP',
    battery: '5000 mAh',
    os: 'Android 14',
    screenRefreshRate: '120 Hz',
  },
  colorOptions: [
    {
      name: 'Titanium Violet',
      hexCode: '#8B7BA8',
      imageUrl:
        'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U-titanium-violet.webp',
    },
    {
      name: 'Titanium Black',
      hexCode: '#2D2926',
      imageUrl:
        'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U-titanium-black.webp',
    },
    {
      name: 'Titanium Gray',
      hexCode: '#7A7A7A',
      imageUrl:
        'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/SMG-S24U-titanium-gray.webp',
    },
  ],
  storageOptions: [
    { capacity: '256 GB', price: 1329 },
    { capacity: '512 GB', price: 1449 },
    { capacity: '1 TB', price: 1669 },
  ],
  similarProducts: [
    {
      id: 'APL-I15PM',
      brand: 'Apple',
      name: 'iPhone 15 Pro Max',
      basePrice: 1319,
      imageUrl:
        'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/APL-I15PM-titanio-negro.webp',
    },
    {
      id: 'SNY-XPERIA1V',
      brand: 'SONY',
      name: 'Xperia 1 V',
      basePrice: 959.42,
      imageUrl:
        'https://prueba-tecnica-api-tienda-moviles.onrender.com/images/SNY-XPERIA1V-negro.webp',
    },
  ],
}

export const apiErrorFixtures = {
  unauthorized: { status: 401, message: 'Invalid API key' },
  notFound: { status: 404, message: 'Product not found' },
  serverError: { status: 500, message: 'Internal server error' },
} as const
