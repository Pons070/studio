
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import type { ThemeSettings } from "@/lib/types";

function constructThemeStyle(theme: ThemeSettings) {
  if (!theme) return {};

  const styles: React.CSSProperties = {
    '--background': theme.backgroundColor,
    '--foreground': 'var(--foreground)', 
    '--card': theme.cardColor,
    '--card-foreground': 'var(--card-foreground)', 
    '--popover': 'var(--popover)',
    '--popover-foreground': 'var(--popover-foreground)',
    '--primary': theme.primaryColor,
    '--primary-foreground': theme.primaryForegroundColor || 'var(--primary-foreground)',
    '--secondary': 'var(--secondary)',
    '--secondary-foreground': 'var(--secondary-foreground)',
    '--muted': 'var(--muted)',
    '--muted-foreground': 'var(--muted-foreground)',
    '--accent': theme.accentColor,
    '--accent-foreground': theme.accentForegroundColor || 'var(--accent-foreground)',
    '--destructive': 'var(--destructive)',
    '--destructive-foreground': 'var(--destructive-foreground)',
    '--border': 'var(--border)',
    '--input': 'var(--input)',
    '--ring': 'var(--ring)',
    '--radius': `${theme.borderRadius || 0.5}rem`,
    '--card-opacity': `${theme.cardOpacity ?? 1}`,
  };

  if (theme.backgroundImageUrl) {
    styles['--background-image'] = `url(${theme.backgroundImageUrl})`;
  } else {
    styles['--background-image'] = 'none';
  }

  // Filter out undefined/null values
  return Object.fromEntries(Object.entries(styles).filter(([_, v]) => v != null));
}

export function ThemeProvider({ children, theme, ...props }: ThemeProviderProps & { theme?: ThemeSettings }) {
  const [style, setStyle] = React.useState<React.CSSProperties>({});
  
  React.useEffect(() => {
    if (theme) {
      const newStyles = constructThemeStyle(theme);
      setStyle(newStyles);
    }
  }, [theme]);

  React.useEffect(() => {
    // Apply styles to the root element
    const root = document.documentElement;
    Object.entries(style).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [style]);


  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
