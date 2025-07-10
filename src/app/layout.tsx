

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CartProvider } from '@/store/cart';
import { OrderProvider } from '@/store/orders';
import { MenuProvider } from '@/store/menu';
import { BrandProvider } from '@/store/brand';
import { ReviewProvider } from '@/store/reviews';
import { AuthProvider } from '@/store/auth';
import { FavoritesProvider } from '@/store/favorites';
import { PromotionProvider } from '@/store/promotions';
import { PromotionBanner } from '@/components/promotion-banner';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'CulinaPreOrder - Delicious Meals, Ordered Ahead',
  description: 'Your favorite restaurant for pre-ordering delicious meals. Order online for pickup or delivery.',
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
          <AuthProvider>
            <BrandProvider>
              <MenuProvider>
                <PromotionProvider>
                  <OrderProvider>
                    <CartProvider>
                      <ReviewProvider>
                        <FavoritesProvider>
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
                      </ReviewProvider>
                    </CartProvider>
                  </OrderProvider>
                </PromotionProvider>
              </MenuProvider>
            </BrandProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
