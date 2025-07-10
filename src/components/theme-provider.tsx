
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
      const root = document.documentElement;
      root.classList.add('theme-dynamic');
      
      const theme = dynamicTheme;
      root.style.setProperty('--dynamic-primary', theme.primaryColor || '');
      root.style.setProperty('--dynamic-primary-foreground', theme.primaryForegroundColor || '');
      root.style.setProperty('--dynamic-background', theme.backgroundColor || '');
      root.style.setProperty('--dynamic-accent', theme.accentColor || '');
      root.style.setProperty('--dynamic-accent-foreground', theme.accentForegroundColor || '');
      root.style.setProperty('--dynamic-card', `hsl(${theme.cardColor || '0 0% 100%'})`);
      root.style.setProperty('--dynamic-radius', `${theme.borderRadius || 0.5}rem`);
      root.style.setProperty('--dynamic-background-image', theme.backgroundImageUrl ? `url(${theme.backgroundImageUrl})` : 'none');
      
      // We set card with opacity directly on the element in globals.css now.
      // Card Alpha is handled by the `bg-card` class with opacity modifier.
    } else {
        document.documentElement.classList.remove('theme-dynamic');
    }
  }, [dynamicTheme]);


  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
