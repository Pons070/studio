import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CartProvider } from '@/store/cart';
import { OrderProvider } from '@/store/orders';
import { MenuProvider } from '@/store/menu';

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
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <MenuProvider>
          <CartProvider>
            <OrderProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
            </OrderProvider>
          </CartProvider>
        </MenuProvider>
      </body>
    </html>
  );
}
