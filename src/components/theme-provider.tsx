
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import type { ThemeSettings } from "@/lib/types"

type CustomThemeProviderProps = ThemeProviderProps & {
  dynamicTheme?: ThemeSettings;
};


export function ThemeProvider({ children, dynamicTheme, ...props }: CustomThemeProviderProps) {
    React.useEffect(() => {
    if (dynamicTheme) {
      const theme = dynamicTheme;
      const themeStyle = `
        :root {
          ${theme.primaryColor ? `--primary: ${theme.primaryColor};` : ''}
          ${theme.primaryForegroundColor ? `--primary-foreground: ${theme.primaryForegroundColor};` : ''}
          ${theme.backgroundColor ? `--background: ${theme.backgroundColor};` : ''}
          ${theme.accentColor ? `--accent: ${theme.accentColor};` : ''}
          ${theme.accentForegroundColor ? `--accent-foreground: ${theme.accentForegroundColor};` : ''}
          ${theme.cardColor ? `--card: hsl(${theme.cardColor});` : ''}
          ${theme.cardOpacity ? `--card-alpha: ${theme.cardOpacity};` : ''}
          ${theme.borderRadius ? `--radius: ${theme.borderRadius}rem;` : ''}
          ${theme.backgroundImageUrl ? `--background-image: url(${theme.backgroundImageUrl});` : '--background-image: none;'}
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
  }, [dynamicTheme]);


  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
