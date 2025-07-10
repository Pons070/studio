
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
import { getBrandInfo } from '@/lib/brand-store';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const brandInfo = await getBrandInfo();
  const theme = brandInfo.theme;
  
  const themeStyle = theme ? `
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
  ` : '';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{brandInfo.name} - Delicious Meals, Ordered Ahead</title>
        <meta name="description" content="Your favorite restaurant for pre-ordering delicious meals. Order online for pickup or delivery." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Open+Sans:wght@400;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
        {theme && <style dangerouslySetInnerHTML={{ __html: themeStyle }} />}
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
                          <div className="flex flex-col min-h-screen">
                            <Header />
                            <PromotionBanner />
                            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                              {children}
                            </main>
                            <Footer brandInfo={brandInfo} />
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
