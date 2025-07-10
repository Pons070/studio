
import type { Metadata } from 'next';
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
import { getBrandInfo } from '@/lib/brand-store';
import { BrandProvider } from '@/store/brand';

function setInitialTheme() {
  const brandInfo = getBrandInfo();
  const theme = brandInfo?.theme;
  if (!theme) return '';

  return `
    :root {
      ${theme.primaryColor ? `--primary: ${theme.primaryColor};` : ''}
      ${theme.backgroundColor ? `--background: ${theme.backgroundColor};` : ''}
      ${theme.accentColor ? `--accent: ${theme.accentColor};` : ''}
      ${theme.cardColor ? `--card: ${theme.cardColor};` : ''}
      ${theme.cardOpacity !== undefined ? `--card-alpha: ${theme.cardOpacity};` : ''}
      ${theme.borderRadius !== undefined ? `--radius: ${theme.borderRadius}rem;` : ''}
      ${theme.backgroundImageUrl ? `--background-image: url(${theme.backgroundImageUrl});` : '--background-image: none;'}
    }
  `;
}

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
  const initialThemeStyles = setInitialTheme();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Open+Sans:wght@400;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: initialThemeStyles }} />
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
