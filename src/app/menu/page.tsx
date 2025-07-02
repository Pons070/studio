"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { menuItems as allMenuItems } from "@/lib/mock-data";
import { useCart } from "@/store/cart";
import { PlusCircle, Utensils, Soup, Cookie, GlassWater } from "lucide-react";
import Image from "next/image";
import type { Metadata } from "next";

// This is a client component, so we can't use Metadata export.
// We can set it in layout or a parent server component if needed.
// export const metadata: Metadata = {
//   title: 'Our Menu - CulinaPreOrder',
//   description: 'Explore our delicious selection of appetizers, main courses, desserts, and drinks.',
// };

const categoryIcons = {
  'Appetizers': <Soup className="h-6 w-6 mr-2" />,
  'Main Courses': <Utensils className="h-6 w-6 mr-2" />,
  'Desserts': <Cookie className="h-6 w-6 mr-2" />,
  'Drinks': <GlassWater className="h-6 w-6 mr-2" />,
};

export default function MenuPage() {
  const { addItem } = useCart();
  const categories = ['Appetizers', 'Main Courses', 'Desserts', 'Drinks'];

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Our Menu</h1>
        <p className="text-lg text-muted-foreground mt-2">Handcrafted with love, just for you.</p>
      </div>

      {categories.map((category) => (
        <section key={category}>
          <h2 className="text-3xl font-headline font-semibold mb-6 flex items-center">
            {categoryIcons[category as keyof typeof categoryIcons]}
            {category}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allMenuItems
              .filter((item) => item.category === category)
              .map((item) => (
                <Card key={item.id} className="flex flex-col overflow-hidden group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardHeader className="p-0">
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        data-ai-hint={item.aiHint}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow pt-4">
                    <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
                    <CardDescription className="mt-1 text-muted-foreground text-sm">{item.description}</CardDescription>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center mt-auto pt-4">
                    <p className="text-xl font-bold text-primary">Rs.{item.price.toFixed(2)}</p>
                    <Button onClick={() => addItem(item)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Add
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
