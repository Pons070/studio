
'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import type { Review } from '@/lib/types';
import { Star } from 'lucide-react';

export function PageClient({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return null;
  }
  return (
    <section>
      <h2 className="text-3xl font-headline font-bold text-center mb-10 text-foreground">What Our Customers Say</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto"
      >
        <CarouselContent>
          {reviews.map((review) => (
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
  )
}
