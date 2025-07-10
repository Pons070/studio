
"use client"

import { useEffect } from "react"
import { useBrand } from "@/store/brand"

export function ThemeInjector() {
  const { brandInfo } = useBrand()

  useEffect(() => {
    if (brandInfo?.theme) {
      const theme = brandInfo.theme
      const root = document.documentElement
      
      const styleMap = {
        '--radius': `${theme.borderRadius ?? 0.5}rem`,
        '--card-opacity': `${theme.cardOpacity ?? 1}`,
        '--background-image': theme.backgroundImageUrl ? `url(${theme.backgroundImageUrl})` : 'none',
        '--background': theme.backgroundColor,
        '--primary': theme.primaryColor,
        '--primary-foreground': theme.primaryForegroundColor,
        '--accent': theme.accentColor,
        '--accent-foreground': theme.accentForegroundColor,
        '--card': theme.cardColor,
      };

      for (const [property, value] of Object.entries(styleMap)) {
        if (value) {
          root.style.setProperty(property, value);
        } else {
            // If a value from the theme is empty, remove the inline style
            // so it can fall back to the stylesheet default.
            root.style.removeProperty(property);
        }
      }
    }
  }, [brandInfo?.theme])

  return null
}
