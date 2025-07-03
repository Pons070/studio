
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMenu } from "@/store/menu";
import { useCart } from "@/store/cart";
import { useBrand } from "@/store/brand";
import { PlusCircle, Utensils, Soup, Cookie, GlassWater, Star, Search } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from '@/store/favorites';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const categoryIcons = {
  'Appetizers': <Soup className="h-6 w-6 mr-2" />,
  'Main Courses': <Utensils className="h-6 w-6 mr-2" />,
  'Desserts': <Cookie className="h-6 w-6 mr-2" />,
  'Drinks': <GlassWater className="h-6 w-6 mr-2" />,
};

export default function MenuPage() {
  const { addItem } = useCart();
  const { menuItems } = useMenu();
  const { brandInfo } = useBrand();
  const { toggleFavoriteItem, isItemFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Appetizers', 'Main Courses', 'Desserts', 'Drinks'];
  const isClosed = brandInfo.businessHours.status === 'closed';

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold">Our Menu</h1>
        <p className="text-lg text-muted-foreground mt-2">Handcrafted with love, just for you.</p>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Search for dishes..."
            className="pl-10 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {categories.map((category) => {
        const itemsInCategory = filteredMenuItems.filter((item) => item.category === category);
        if (itemsInCategory.length === 0) return null;

        return (
          <section key={category}>
            <h2 className="text-3xl font-headline font-semibold mb-6 flex items-center">
              {categoryIcons[category as keyof typeof categoryIcons]}
              {category}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {itemsInCategory.map((item) => (
                <Card key={item.id} className="flex flex-col overflow-hidden group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative">
                   {isAuthenticated && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 z-20 h-9 w-9 rounded-full bg-background hover:bg-muted"
                      onClick={() => toggleFavoriteItem(item.id)}
                      aria-label="Toggle favorite"
                    >
                      <Star className={cn("h-5 w-5 transition-colors", isItemFavorite(item.id) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                    </Button>
                  )}
                  <CardHeader className="p-0">
                    <div className="aspect-video relative overflow-hidden">
                       {!item.isAvailable && (
                        <div className="absolute inset-0 bg-background/90 z-10 flex items-center justify-center">
                            <Badge variant="destructive" className="text-base px-4 py-1">Unavailable</Badge>
                        </div>
                      )}
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
                    <Button onClick={() => addItem(item)} disabled={isClosed || !item.isAvailable}>
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Add
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  );
}
