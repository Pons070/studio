
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
        '--accent': theme.accentColor,
        '--card': theme.cardColor,
      };

      for (const [property, value] of Object.entries(styleMap)) {
        if (value) {
          root.style.setProperty(property, String(value));
        } else {
          root.style.removeProperty(property);
        }
      }
    }
  }, [brandInfo?.theme])

  return null
}
