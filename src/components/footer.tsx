"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Utensils, Twitter, Facebook, Instagram } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-card border-t mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="text-lg font-headline font-bold text-foreground">CulinaPreOrder</span>
          </div>
          <div className="text-center mb-4 md:mb-0">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} CulinaPreOrder. All rights reserved.
            </p>
             <Link href="/admin/login" className="text-xs text-muted-foreground hover:text-primary">
              Admin Login
            </Link>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
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
        </div>
      </div>
    </footer>
  );
}
