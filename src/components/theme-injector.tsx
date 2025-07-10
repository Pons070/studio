
"use client";

import { useBrand } from '@/store/brand';
import { useEffect } from 'react';

export function ThemeInjector() {
  const { brandInfo } = useBrand();
  
  useEffect(() => {
    if (brandInfo?.theme) {
      const theme = brandInfo.theme;
      const themeStyle = `
        :root {
          --primary: ${theme.primaryColor};
          ${theme.primaryForegroundColor ? `--primary-foreground: ${theme.primaryForegroundColor};` : ''}
          --background: ${theme.backgroundColor};
          --accent: ${theme.accentColor};
          ${theme.accentForegroundColor ? `--accent-foreground: ${theme.accentForegroundColor};` : ''}
          --card: hsl(${theme.cardColor});
          --card-alpha: ${theme.cardOpacity};
          --radius: ${theme.borderRadius}rem;
          --background-image: ${theme.backgroundImageUrl ? `url(${theme.backgroundImageUrl})` : 'none'};
        }
      `;
      
      let styleElement = document.getElementById('dynamic-theme-styles');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'dynamic-theme-styles';
        document.head.appendChild(styleElement);
      }
      styleElement.innerHTML = themeStyle;
    }
  }, [brandInfo]);

  return null;
}
