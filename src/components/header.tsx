
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Utensils, User, LogOut, History, LogIn, UserPlus, Settings, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBrand } from '@/store/brand';
import Image from 'next/image';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';
import { CartSheet } from './cart-sheet';
import { useCart } from '@/store/cart';
import { Badge } from './ui/badge';

export function Header() {
  const pathname = usePathname();
  const { brandInfo } = useBrand();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { items } = useCart();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2">
            {brandInfo.logoUrl ? (
              <Image src={brandInfo.logoUrl} alt={`${brandInfo.name} logo`} width={40} height={40} className={cn("object-contain", brandInfo.logoShape === 'circle' ? 'rounded-full' : 'rounded-md')} />
            ) : (
              <Utensils className="h-8 w-8 text-primary" />
            )}
            <span className="text-2xl font-headline font-bold text-foreground">{brandInfo.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-lg font-medium">
            <Link href="/menu" className="text-muted-foreground hover:text-primary transition-colors">
              Menu
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
              About Us
            </Link>
             <Link href="/reviews" className="text-muted-foreground hover:text-primary transition-colors">
              Reviews
            </Link>
          </nav>

          <div className="flex items-center gap-4">
              <CartSheet>
                <Button variant="outline" size="icon" className="relative">
                    <Utensils className="h-6 w-6" />
                    {itemCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center text-xs">
                            {itemCount}
                        </Badge>
                    )}
                </Button>
              </CartSheet>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <User className="h-6 w-6" />
                  <span className="sr-only">User Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated && currentUser ? (
                  <>
                    <DropdownMenuLabel>Hi, {currentUser.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                      <Link href="/profile"><Settings className="mr-2 h-4 w-4" />My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders"><History className="mr-2 h-4 w-4" />Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites"><Star className="mr-2 h-4 w-4" />Favorites</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Welcome, Guest</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Log In / Sign Up</Link>
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
