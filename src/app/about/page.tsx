
"use client";

import { useBrand } from '@/store/brand';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote, Building, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AboutPage() {
  const { brandInfo, isLoading } = useBrand();

  if (isLoading) {
    return (
      <div className="space-y-12">
        <div className="text-center">
          <Skeleton className="h-12 w-3/4 mx-auto mb-2" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <Skeleton className="h-8 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!brandInfo) {
    return (
        <div className="text-center py-10">
            <p className="text-muted-foreground">Could not load brand information.</p>
        </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-white">About {brandInfo.name}</h1>
        <p className="text-lg text-white font-bold mt-2">
          Learn more about our story and what makes us special.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Card className="shadow-lg h-full">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center">
                        <Quote className="h-6 w-6 mr-2 text-primary" />
                        Our Story
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line text-lg leading-relaxed">
                        {brandInfo.about}
                    </p>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center">
                        <Building className="h-5 w-5 mr-2 text-primary" />
                        Our Location
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                   <p>{brandInfo.address.doorNumber}, {brandInfo.address.apartmentName}</p>
                   <p>{brandInfo.address.area}</p>
                   <p>{brandInfo.address.city}, {brandInfo.address.state} - {brandInfo.address.pincode}</p>
                </CardContent>
            </Card>
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center">
                        <Phone className="h-5 w-5 mr-2 text-primary" />
                         Contact Us
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>{brandInfo.phone}</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
