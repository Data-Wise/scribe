import { useEffect } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'

/**
 * Apply icon glow effect settings to the root element
 * Controls the intensity of the glow effect on active project icons
 */
export function useIconGlowEffect() {
  const settings = useSettingsStore(state => state.settings)

  useEffect(() => {
    const isEnabled = settings['appearance.iconGlowEffect'] ?? true
    const intensity = settings['appearance.iconGlowIntensity'] ?? 'subtle'

    // Apply data attribute to root element
    if (isEnabled) {
      document.documentElement.setAttribute('data-icon-glow', intensity)
    } else {
      document.documentElement.removeAttribute('data-icon-glow')
    }
  }, [settings])
}
