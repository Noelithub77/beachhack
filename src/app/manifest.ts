import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'COCO - Context Oriented Customer Ops',
    short_name: 'COCO',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#f6f46cff',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml'
      }
    ]
  }
}