'use client'

import { useEffect } from 'react'

export default function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', { 
            scope: '/',
            updateViaCache: 'none' 
          })
          console.log('Service Worker registered:', registration)
        } catch (error) {
          console.error('Service Worker registration failed:', error)
        }
      }
      // Wait for page to fully load before registering
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', register)
      } else {
        register()
      }
    }
  }, [])
  return null
}
