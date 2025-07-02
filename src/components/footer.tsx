
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Utensils, Twitter, Facebook, Instagram } from "lucide-react";
import { useBrand } from "@/store/brand";
import Image from "next/image";

export function Footer() {
  const pathname = usePathname();
  const { brandInfo } = useBrand();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-card border-t mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8 items-center text-center md:text-left">
          
          <div className="flex items-center gap-2 justify-center md:justify-start">
             {brandInfo.logoUrl ? (
              <Image src={brandInfo.logoUrl} alt={`${brandInfo.name} logo`} width={32} height={32} className="rounded-md object-contain" />
            ) : (
              <Utensils className="h-6 w-6 text-primary" />
            )}
            <span className="text-lg font-headline font-bold text-foreground">{brandInfo.name}</span>
          </div>

          <div className="text-muted-foreground text-sm space-y-1">
             <p className="font-semibold text-foreground whitespace-pre-line">{brandInfo.address}</p>
             <p>{brandInfo.phone}</p>
             <p>
              © {new Date().getFullYear()} {brandInfo.name}. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex gap-4">
               <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
             <Link href="/admin/login" className="text-xs text-muted-foreground hover:text-primary mt-2">
              Admin Login
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
