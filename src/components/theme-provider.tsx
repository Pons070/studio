
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
    const root = document.documentElement;
    if (dynamicTheme) {
      root.style.setProperty('--dynamic-primary', dynamicTheme.primaryColor || '');
      root.style.setProperty('--dynamic-primary-foreground', dynamicTheme.primaryForegroundColor || '');
      root.style.setProperty('--dynamic-background', dynamicTheme.backgroundColor || '');
      root.style.setProperty('--dynamic-accent', dynamicTheme.accentColor || '');
      root.style.setProperty('--dynamic-accent-foreground', dynamicTheme.accentForegroundColor || '');
      root.style.setProperty('--dynamic-card', `hsl(${dynamicTheme.cardColor || '0 0% 100%'})`);
      root.style.setProperty('--dynamic-radius', `${dynamicTheme.borderRadius || 0.5}rem`);
      root.style.setProperty('--dynamic-background-image', dynamicTheme.backgroundImageUrl ? `url(${dynamicTheme.backgroundImageUrl})` : 'none');
      root.style.setProperty('--dynamic-card-opacity', String(dynamicTheme.cardOpacity ?? 1));
    }
  }, [dynamicTheme]);


  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
