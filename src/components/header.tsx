"use client";

import Link from 'next/link';
import { Button } from './ui/button';
import { Utensils, User, ShoppingCart, LogOut, History, LogIn, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CartSheet } from './cart-sheet';
import { useCart } from '@/store/cart';

export function Header() {
  const { items } = useCart();
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const isAuthenticated = false; // Placeholder for auth logic

  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2">
            <Utensils className="h-8 w-8 text-primary" />
            <span className="text-2xl font-headline font-bold text-foreground">CulinaPreOrder</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-lg font-medium">
            <Link href="/menu" className="text-muted-foreground hover:text-primary transition-colors">
              Menu
            </Link>
            <Link href="/orders" className="text-muted-foreground hover:text-primary transition-colors">
              My Orders
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative">
              <CartSheet>
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="sr-only">Open Cart</span>
                </Button>
              </CartSheet>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <User className="h-6 w-6" />
                  <span className="sr-only">User Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/orders"><History className="mr-2 h-4 w-4" />Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Welcome, Guest</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Log In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/signup"><UserPlus className="mr-2 h-4 w-4" />Sign Up</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
