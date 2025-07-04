

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, AlertTriangle, User, Trash2, Home, Building, FileText } from 'lucide-react';
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
import type { Address } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';


export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { brandInfo } = useBrand();
  const { currentUser, isAuthenticated } = useAuth();
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | undefined>();
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();
  const [cookingNotes, setCookingNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClearCartAlertOpen, setClearCartAlertOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  const isClosed = brandInfo.businessHours.status === 'closed';

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      setPickupDate(new Date());
    }
  }, [isClient]);

  useEffect(() => {
    if (currentUser?.addresses && currentUser.addresses.length > 0) {
        const defaultAddress = currentUser.addresses.find(a => a.isDefault) || currentUser.addresses[0];
        if (defaultAddress?.id) {
            setSelectedAddressId(defaultAddress.id);
        }
    }
  }, [currentUser]);

  const isProfileIncomplete = isAuthenticated && !currentUser?.phone;
  const hasNoAddress = isAuthenticated && (!currentUser?.addresses || currentUser.addresses.length === 0);
  const selectedAddress = currentUser?.addresses?.find(a => a.id === selectedAddressId);
  const isUserBlocked = isAuthenticated && currentUser ? (brandInfo.blockedCustomerEmails || []).includes(currentUser.email) : false;

  const handlePlaceOrder = async () => {
    if (!isAuthenticated || !currentUser) {
      toast({
        title: "Please Log In",
        description: "You need to be logged in to place an order.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }

    if (isUserBlocked) {
        toast({
            title: "Order Failed",
            description: "Your account has been blocked. You cannot place new orders.",
            variant: "destructive",
        });
        return;
    }

    if (isProfileIncomplete || hasNoAddress) {
       toast({
        title: "Profile Incomplete",
        description: "Please update your profile with your phone and at least one address.",
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
    
    if (!selectedAddressId) {
        toast({
            title: "No Address Selected",
            description: "Please select a delivery address.",
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
    
    const deliveryAddress = currentUser?.addresses?.find(a => a.id === selectedAddressId);
    if (!deliveryAddress) {
        toast({ title: "Address not found.", variant: "destructive" });
        return;
    }

    setIsProcessing(true);
    
    await addOrder(items, totalPrice, pickupDate, time, deliveryAddress, cookingNotes);

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
  
  const formatAddress = (address: Address) => {
    return `${address.doorNumber}, ${address.apartmentName}${address.floorNumber ? `, ${address.floorNumber}` : ''}, ${address.area}, ${address.city} - ${address.pincode}`;
  }

  return (
    <div>
      <h1 className="text-4xl font-headline font-bold text-center mb-10">Checkout</h1>
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
            {isUserBlocked && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Account Blocked</AlertTitle>
                    <AlertDescription>
                        Your account is currently blocked. You cannot place new orders. Please contact support for assistance.
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
                  {isClient && pickupDate ? (
                     <Popover open={isCalendarOpen} onOpenChange={setCalendarOpen}>
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
                            setCalendarOpen(false);
                          }}
                          disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                     <Button
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal text-muted-foreground"
                        disabled
                      >
                       <CalendarIcon className="mr-2 h-4 w-4" />
                       <span>Pick a date</span>
                      </Button>
                  )}
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
                <CardHeader>
                    <CardTitle>2. Select Delivery Address</CardTitle>
                </CardHeader>
                <CardContent>
                    {hasNoAddress || isProfileIncomplete ? (
                        <Alert variant="destructive">
                            <User className="h-4 w-4" />
                            <AlertTitle>Profile Incomplete</AlertTitle>
                            <AlertDescription className="flex justify-between items-center">
                            <span>Please add a phone number and address.</span>
                            <Button asChild variant="secondary" size="sm">
                                <Link href="/profile">Update Profile</Link>
                            </Button>
                            </AlertDescription>
                        </Alert>
                    ) : (
                         <Select onValueChange={setSelectedAddressId} value={selectedAddressId}>
                            <SelectTrigger className="w-full text-left h-auto items-start py-2">
                                <SelectValue asChild>
                                    {selectedAddress ? (
                                        <div className="flex items-center gap-3">
                                            <div className="shrink-0">
                                                {selectedAddress.label === 'Home' ? <Home className="h-5 w-5 text-muted-foreground" /> : <Building className="h-5 w-5 text-muted-foreground" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold">{selectedAddress.label} {selectedAddress.isDefault && <Badge variant="outline" className="font-medium ml-2">Default</Badge>}</p>
                                                <p className="text-sm text-muted-foreground truncate">{formatAddress(selectedAddress)}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">Select a delivery address...</span>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {(currentUser?.addresses || []).map(address => (
                                    <SelectItem key={address.id} value={address.id!} className="py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="shrink-0">
                                                {address.label === 'Home' ? <Home className="h-5 w-5 text-muted-foreground" /> : <Building className="h-5 w-5 text-muted-foreground" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold">{address.label} {address.isDefault && <Badge variant="outline" className="font-medium ml-2">Default</Badge>}</p>
                                                <p className="text-sm text-muted-foreground">{formatAddress(address)}</p>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> 3. Cooking Notes (Optional)</CardTitle>
                    <CardDescription>Have any special requests? Let the chef know.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="e.g., Please make it extra spicy, no nuts."
                        value={cookingNotes}
                        onChange={(e) => setCookingNotes(e.target.value)}
                    />
                </CardContent>
            </Card>

        </div>

        <div className="space-y-8 lg:sticky top-24 h-fit">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>4. Order Summary</CardTitle>
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
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                        {items.map(item => (
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
                        ))}
                    </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Your cart is empty.</p>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-xl">
                  <p>Total</p>
                  <p>Rs.{totalPrice.toFixed(2)}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handlePlaceOrder} disabled={isProcessing || isClosed || hasNoAddress || isProfileIncomplete || items.length === 0 || isUserBlocked} size="lg" className="w-full">
                  {isProcessing ? 'Processing...' : 'Place Pre-Order'}
                </Button>
              </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
