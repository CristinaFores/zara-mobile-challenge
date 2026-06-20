import path from 'path'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'prueba-tecnica-api-tienda-moviles.onrender.com',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: 'prueba-tecnica-api-tienda-moviles.onrender.com',
        pathname: '/images/**',
      },
    ],
  },
  sassOptions: {
    includePaths: [path.resolve(__dirname, 'src/scss')],
  },
}

export default nextConfig
