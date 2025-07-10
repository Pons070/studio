
"use client";

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CartProvider } from '@/store/cart';
import { OrderProvider } from '@/store/orders';
import { MenuProvider } from '@/store/menu';
import { AuthProvider } from '@/store/auth';
import { FavoritesProvider } from '@/store/favorites';
import { PromotionProvider } from '@/store/promotions';
import { PromotionBanner } from '@/components/promotion-banner';
import { ThemeProvider } from '@/components/theme-provider';
import { BrandProvider } from '@/store/brand';
import { ReviewProvider } from '@/store/reviews';
import { useBrand } from '@/store/brand';
import { useEffect } from 'react';

// This is a client component that will apply theme styles dynamically
function DynamicThemeStyler() {
  const { brandInfo } = useBrand();

  useEffect(() => {
    const theme = brandInfo?.theme;
    if (!theme) return;
    
    const root = document.documentElement;
    if (theme.primaryColor) root.style.setProperty('--primary', theme.primaryColor);
    if (theme.backgroundColor) root.style.setProperty('--background', theme.backgroundColor);
    if (theme.accentColor) root.style.setProperty('--accent', theme.accentColor);
    if (theme.cardColor) root.style.setProperty('--card', `hsl(${theme.cardColor})`);
    if (theme.cardOpacity !== undefined) root.style.setProperty('--card-alpha', theme.cardOpacity.toString());
    if (theme.borderRadius !== undefined) root.style.setProperty('--radius', `${theme.borderRadius}rem`);
    if (theme.backgroundImageUrl) {
      root.style.setProperty('--background-image', `url(${theme.backgroundImageUrl})`);
    } else {
      root.style.setProperty('--background-image', 'none');
    }

  }, [brandInfo]);
  
  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>CulinaPreOrder - Delicious Meals, Ordered Ahead</title>
        <meta name="description" content="Your favorite restaurant for pre-ordering delicious meals. Order online for pickup or delivery." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Open+Sans:wght@400;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <BrandProvider>
            <AuthProvider>
              <MenuProvider>
                <PromotionProvider>
                  <OrderProvider>
                    <ReviewProvider>
                      <CartProvider>
                        <FavoritesProvider>
                           <DynamicThemeStyler />
                          <div className="flex flex-col min-h-screen">
                            <Header />
                            <PromotionBanner />
                            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                              {children}
                            </main>
                            <Footer />
                          </div>
                          <Toaster />
                        </FavoritesProvider>
                      </CartProvider>
                    </ReviewProvider>
                  </OrderProvider>
                </PromotionProvider>
              </MenuProvider>
            </AuthProvider>
          </BrandProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
