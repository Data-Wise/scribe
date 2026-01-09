import { useEffect } from 'react'
import { BUILT_IN_THEMES, applyTheme } from '../lib/themes'
import { logger } from '../lib/logger'

// Apply Forest Night theme on app load
export function useForestTheme() {
  useEffect(() => {
    const forestTheme = BUILT_IN_THEMES['forest-night']
    applyTheme(forestTheme)
    logger.debug('🌲 Forest Night theme applied')
  }, [])
}
