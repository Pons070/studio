
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Utensils, Instagram, Youtube } from "lucide-react";
import { useBrand } from "@/store/brand";
import Image from "next/image";
import type { Address } from "@/lib/types";
import { useState, useRef, useCallback } from "react";

const formatAddress = (address: Address) => {
    if (!address) return '';
    const { doorNumber, apartmentName, area, city, state, pincode } = address;
    return `${doorNumber} ${apartmentName}\n${area}, ${city}\n${state} ${pincode}`;
};

export function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const { brandInfo } = useBrand();
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
    }

    if (newCount === 5) {
        router.push('/admin/login');
        setClickCount(0);
    } else {
        clickTimeoutRef.current = setTimeout(() => {
            setClickCount(0);
        }, 2000); // 2 second window for clicks
    }
  }, [clickCount, router]);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-card border-t mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start col-span-2 md:col-span-1">
            <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer">
               {brandInfo.logoUrl ? (
                <Image src={brandInfo.logoUrl} alt={`${brandInfo.name} logo`} width={32} height={32} className="rounded-md object-contain" />
              ) : (
                <Utensils className="h-6 w-6 text-primary" />
              )}
              <span className="text-lg font-headline font-bold text-foreground">{brandInfo.name}</span>
            </Link>
          </div>

          <div className="text-muted-foreground text-sm space-y-2">
             <h4 className="font-semibold text-foreground mb-2">Contact</h4>
             <p className="whitespace-pre-line">{formatAddress(brandInfo.address)}</p>
             <p>{brandInfo.phone}</p>
          </div>
          
          <div className="text-muted-foreground text-sm space-y-2">
             <h4 className="font-semibold text-foreground mb-2">Explore</h4>
             <ul className="space-y-1">
                <li><Link href="/about" className="hover:text-primary hover:underline">About Us</Link></li>
                <li><Link href="/menu" className="hover:text-primary hover:underline">Menu</Link></li>
                <li><Link href="/orders" className="hover:text-primary hover:underline">My Orders</Link></li>
                <li><Link href="/reviews" className="hover:text-primary hover:underline">Reviews</Link></li>
             </ul>
          </div>

          <div className="text-muted-foreground text-sm space-y-2 text-center md:text-right">
             <h4 className="font-semibold text-foreground mb-2">Follow Us</h4>
            <div className="flex gap-4 justify-center md:justify-end">
              {brandInfo.instagramUrl && (
                <Link href={brandInfo.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {brandInfo.youtubeUrl && (
                <Link href={brandInfo.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  <Youtube className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {brandInfo.name}. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}
