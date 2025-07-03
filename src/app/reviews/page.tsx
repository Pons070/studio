
"use client";

import { useReviews } from '@/store/reviews';
import { useBrand } from '@/store/brand';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-5 w-5",
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { reviews } = useReviews();
  const { brandInfo } = useBrand();
  const publishedReviews = reviews.filter(r => r.isPublished);

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Customer Reviews</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Hear what our valued customers have to say about {brandInfo.name}.
        </p>
      </div>

      {publishedReviews.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publishedReviews.map((review) => (
            <Card key={review.id} className="flex flex-col justify-between shadow-lg transform transition-transform duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="flex justify-between items-center">
                   <p className="font-bold text-lg">{review.customerName}</p>
                   <StarDisplay rating={review.rating} />
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                 <div className="flex gap-4">
                    <Quote className="h-8 w-8 text-primary shrink-0 mt-1" />
                    <p className="text-muted-foreground italic">"{review.comment}"</p>
                 </div>
              </CardContent>
              {review.adminReply && (
                <CardFooter className="flex-col items-start !pb-6 pt-0">
                    <div className="p-4 bg-muted/50 rounded-md mt-4 border-l-4 border-primary w-full">
                        <p className="font-semibold text-sm text-primary">Reply from {brandInfo.name}</p>
                        <p className="text-muted-foreground text-sm italic mt-1">"{review.adminReply}"</p>
                    </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">There are no published reviews yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
