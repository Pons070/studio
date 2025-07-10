
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ChefHat, UtensilsCrossed, Smartphone, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FloatingRecommendButton } from '@/components/floating-recommend-button';
import { HomePageClient } from '@/components/home-page-client';
import { useMenu } from '@/store/menu';
import { useBrand } from '@/store/brand';
import { useReviews } from '@/store/reviews';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { brandInfo, isLoading: isBrandLoading } = useBrand();
  const { menuItems, isLoading: isMenuLoading } = useMenu();
  const { reviews, isLoading: isReviewsLoading } = useReviews();
  
  const isLoading = isBrandLoading || isMenuLoading || isReviewsLoading;
  
  if (isLoading || !brandInfo) {
    return (
      <div className="space-y-20">
        {/* Hero Skeleton */}
        <section className="text-center bg-card p-8 md:p-12 rounded-lg shadow-lg">
          <Skeleton className="h-16 w-3/4 mx-auto mb-8" />
          <Skeleton className="h-12 w-48 mx-auto" />
        </section>

        {/* Featured Items Skeleton */}
        <section>
          <h2 className="text-3xl font-headline font-bold text-center mb-10 text-foreground">Featured Dishes</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader className="p-0">
                  <Skeleton className="aspect-video w-full" />
                </CardHeader>
                <CardContent className="flex-grow pt-6 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <Skeleton className="h-7 w-1/4" />
                  <Skeleton className="h-10 w-32" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works Skeleton */}
         <section className="bg-card rounded-lg p-8 md:p-12 shadow-lg">
          <h2 className="text-3xl font-headline font-bold text-center mb-10"><Skeleton className="h-8 w-64 mx-auto" /></h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="h-16 w-16 rounded-full mb-4" />
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
            ))}
          </div>
        </section>
      </div>
    );
  }
  
  const featuredItems = menuItems.filter(item => item.isFeatured).slice(0, 3);
  const featuredReviews = reviews.filter(r => r.isPublished).slice(0, 6);
  const isClosed = brandInfo?.businessHours?.status === 'closed';

  return (
    <>
      <div className="space-y-20">
        {isClosed && (
          <Alert variant="destructive" className="items-center">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>We are currently closed for pre-orders</AlertTitle>
            <AlertDescription>{brandInfo.businessHours.message}</AlertDescription>
          </Alert>
        )}
        <section className="text-center bg-card p-8 md:p-12 rounded-lg shadow-lg">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground mb-8 leading-tight">
            Savor the Moment, <span className="text-primary">Skip the Wait.</span>
          </h1>
          <Button asChild size="lg" className="font-bold text-lg" disabled={isClosed}>
            <Link href="/menu">
              Order Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>

        <section>
          <h2 className="text-3xl font-headline font-bold text-center mb-10 text-foreground">Featured Dishes</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredItems.map((item) => (
              <Card key={item.id} className="flex flex-col overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-md hover:shadow-xl">
                <CardHeader className="p-0">
                  <div className="aspect-video relative">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      data-ai-hint={item.aiHint}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow pt-6">
                  <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
                  <CardDescription className="mt-2 text-muted-foreground">{item.description}</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <p className="text-lg font-bold text-primary">Rs.{item.price.toFixed(2)}</p>
                  <Button asChild variant="ghost" className="text-accent hover:bg-accent/10 hover:text-accent">
                     <Link href="/menu">
                      View Menu <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-card rounded-lg p-8 md:p-12 shadow-lg">
          <h2 className="text-3xl font-headline font-bold text-center mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary mb-4">
                <UtensilsCrossed className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-headline font-semibold mb-2">1. Browse the Menu</h3>
              <p className="text-muted-foreground">Explore our diverse menu of freshly prepared dishes, from appetizers to desserts.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary mb-4">
                <Smartphone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-headline font-semibold mb-2">2. Place Your Pre-Order</h3>
              <p className="text-muted-foreground">Add items to your cart and select your desired date and time for pickup or delivery.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary mb-4">
                <ChefHat className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-headline font-semibold mb-2">3. Enjoy Your Meal</h3>
              <p className="text-muted-foreground">Your order will be freshly prepared and ready for you, right on schedule. Enjoy!</p>
            </div>
          </div>
        </section>
        
        <HomePageClient reviews={featuredReviews}/>
        
      </div>
      <FloatingRecommendButton shareUrl="/" />
    </>
  );
}
