'use client'

import { useEffect } from 'react'

export default function SwRegister() {
  useEffect(() => {
    console.log('[APP] SwRegister mounted, navigator.serviceWorker:', !!navigator.serviceWorker)
    
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try {
          console.log('[APP] Attempting to register /sw.js...')
          // Test if sw.js exists first
          const swResponse = await fetch('/sw.js')
          console.log('[APP] /sw.js fetch status:', swResponse.status)
          
          const registration = await navigator.serviceWorker.register('/sw.js', { 
            scope: '/',
            updateViaCache: 'none' 
          })
          console.log('[APP] Service Worker registered:', registration)
        } catch (error) {
          console.error('[APP] Service Worker registration failed:', error)
        }
      }
      
      // Wait for page to fully load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', register)
      } else {
        register()
      }
    } else {
      console.warn('[APP] Service Workers not supported')
    }
  }, [])
  return null
}
