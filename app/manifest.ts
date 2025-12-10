import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lango',
    short_name: 'Lango',
    description: 'Lango language learining app',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: 'icons/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: 'icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}