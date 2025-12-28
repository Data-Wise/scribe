import { useEffect } from 'react'
import { BUILT_IN_THEMES, applyTheme } from '../lib/themes'

// Apply Forest Night theme on app load
export function useForestTheme() {
  useEffect(() => {
    const forestTheme = BUILT_IN_THEMES['forest-night']
    applyTheme(forestTheme)
    console.log('🌲 Forest Night theme applied')
  }, [])
}
