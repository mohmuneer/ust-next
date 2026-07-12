import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/ustproject/uploads/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: http:",
              "font-src 'self' data:",
              "connect-src 'self' https://ep-flat-boat-atks0nkx-pooler.c-9.us-east-1.aws.neon.tech wss://ep-flat-boat-atks0nkx-pooler.c-9.us-east-1.aws.neon.tech",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:8080/ustproject/uploads/:path*',
      },
    ]
  },
}

export default nextConfig
