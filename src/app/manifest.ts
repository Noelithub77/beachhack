import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'orderGo',
    short_name: 'orderGo',
    display: 'standalone',
    background_color: '#ff9f5f',
    theme_color: '#ff4700',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon'
      }
    ]
  }
}