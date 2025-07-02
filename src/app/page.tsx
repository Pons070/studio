"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ChefHat, UtensilsCrossed, Smartphone, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { reviews } from '@/lib/mock-data';
import { useMenu } from '@/store/menu';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

export default function Home() {
  const { menuItems } = useMenu();
  const featuredItems = menuItems.filter(item => item.category === 'Main Courses').slice(0, 3);
  const featuredReviews = reviews.slice(0, 5);

  return (
    <div className="space-y-20">
      <section className="text-center bg-card p-8 md:p-12 rounded-lg shadow-lg">
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground mb-4 leading-tight">
          Savor the Moment, <span className="text-primary">Skip the Wait.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Welcome to CulinaPreOrder, where exceptional flavors meet ultimate convenience. Pre-order your favorite dishes and enjoy a seamless dining experience.
        </p>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg">
          <Link href="/menu">
            Order Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>

      <section>
        <h2 className="text-3xl font-headline font-bold text-center mb-10">Featured Dishes</h2>
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

      <section className="bg-secondary/50 rounded-lg p-8 md:p-12">
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

      <section>
        <h2 className="text-3xl font-headline font-bold text-center mb-10">What Our Customers Say</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto"
        >
          <CarouselContent>
            {featuredReviews.map((review) => (
              <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <Card className="flex flex-col h-full justify-between">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("h-5 w-5", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                        ))}
                      </div>
                      <p className="text-muted-foreground text-sm italic grow">"{review.comment}"</p>
                       {review.adminReply && (
                         <div className="p-3 bg-muted/50 rounded-md mt-2 border-l-2 border-primary/50">
                            <p className="font-semibold text-xs text-primary">Restaurant's Reply</p>
                            <p className="text-muted-foreground text-xs italic">"{review.adminReply}"</p>
                        </div>
                      )}
                    </CardContent>
                     <CardFooter className="p-6 pt-0">
                         <p className="font-bold text-sm self-end w-full text-right">- {review.customerName}</p>
                    </CardFooter>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </section>
    </div>
  );
}
