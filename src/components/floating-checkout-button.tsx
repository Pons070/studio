"use client";

import { useCart } from '@/store/cart';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export function FloatingCheckoutButton() {
  const { items, totalPrice } = useCart();

  if (items.length === 0) {
    return null;
  }

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <Button asChild size="lg" className="w-full shadow-lg text-lg h-14">
        <Link href="/checkout" className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span>{itemCount} {itemCount > 1 ? 'items' : 'item'}</span>
            </div>
            <span>Checkout</span>
            <span className="font-bold">Rs.{totalPrice.toFixed(2)}</span>
        </Link>
      </Button>
    </div>
  );
}
