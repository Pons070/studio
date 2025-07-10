
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote, Building, Phone } from 'lucide-react';
import { getBrandInfo } from '@/lib/brand-store';
import type { BrandInfo } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function AboutPage() {
  const brandInfo: BrandInfo | null = await getBrandInfo();

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
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground">About {brandInfo.name}</h1>
        <p className="text-lg text-muted-foreground mt-2">
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
            {brandInfo.showAddressInAbout && (
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
            )}
             {brandInfo.showPhoneInAbout && (
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
            )}
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
