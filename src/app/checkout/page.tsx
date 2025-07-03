
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, AlertTriangle, User, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/store/cart';
import { useOrders } from '@/store/orders';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useBrand } from '@/store/brand';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/store/auth';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { brandInfo } = useBrand();
  const { currentUser, isAuthenticated } = useAuth();
  const [pickupDate, setPickupDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClearCartAlertOpen, setClearCartAlertOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  const isClosed = brandInfo.businessHours.status === 'closed';
  const isProfileIncomplete = isAuthenticated && (!currentUser?.phone || !currentUser?.address);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please Log In",
        description: "You need to be logged in to place an order.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    if (isProfileIncomplete) {
       toast({
        title: "Profile Incomplete",
        description: "Please update your profile with your phone and address before ordering.",
        variant: "destructive",
      });
      return;
    }

    if (!pickupDate || !time) {
        toast({
            title: "Incomplete Information",
            description: "Please select a date and time for your order.",
            variant: "destructive",
        });
        return;
    }

    if (items.length === 0) {
        toast({
            title: "Empty Cart",
            description: "Please add items to your cart before checking out.",
            variant: "destructive",
        });
        return;
    }

    setIsProcessing(true);
    
    await addOrder(items, totalPrice, pickupDate, time);

    setIsProcessing(false);
    clearCart();
    router.push('/orders');
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Cart Cleared",
      description: "Your shopping cart has been emptied.",
    });
    router.push('/menu');
  };
  
  const availableTimes = ["12:00", "12:30", "13:00", "18:00", "18:30", "19:00", "19:30", "20:00"];

  if (isClosed) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Restaurant Closed</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="items-center">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>We are currently closed for pre-orders</AlertTitle>
            <AlertDescription>{brandInfo.businessHours.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <h1 className="text-4xl font-headline font-bold text-center mb-10">Checkout</h1>
      <div className="max-w-3xl mx-auto space-y-8">
        {isProfileIncomplete && (
          <Alert variant="destructive">
            <User className="h-4 w-4" />
            <AlertTitle>Profile Incomplete</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>Please provide your phone number and address.</span>
              <Button asChild variant="secondary" size="sm">
                <Link href="/profile">Update Profile</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>1. Select Pickup Time</CardTitle>
            <CardDescription>Choose when you'd like to receive your order.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 md:gap-8">
            <div className="space-y-2">
              <Label>Pre-Order Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !pickupDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {pickupDate ? format(pickupDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={pickupDate}
                    onSelect={(newDate) => {
                      setPickupDate(newDate);
                      const trigger = document.querySelector('[aria-haspopup="dialog"]');
                      if (trigger instanceof HTMLElement) trigger.click();
                    }}
                    disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Available Times</Label>
              <Select onValueChange={setTime} value={time}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>2. Order Summary</CardTitle>
            {items.length > 0 && (
              <AlertDialog open={isClearCartAlertOpen} onOpenChange={setClearCartAlertOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive border-destructive/50 hover:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Cart
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove all items from your cart. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearCart} className={buttonVariants({ variant: "destructive" })}>
                      Yes, Clear Cart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length > 0 ? (
              items.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="rounded-md" />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p>Rs.{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Your cart is empty.</p>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-xl">
              <p>Total</p>
              <p>Rs.{totalPrice.toFixed(2)}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handlePlaceOrder} disabled={isProcessing || isClosed || isProfileIncomplete || items.length === 0} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isProcessing ? 'Processing...' : 'Place Pre-Order'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
