
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, AlertTriangle, User, Trash2, Home, Building, FileText, TicketPercent, X, Truck, PlusCircle, Edit, Minus, Plus } from 'lucide-react';
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
import type { Address, Promotion } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { usePromotions } from '@/store/promotions';
import { AddressDialog } from '@/components/address-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


export default function CheckoutPage() {
  const { items, totalPrice, clearCart, updateQuantity, removeItem } = useCart();
  const { addOrder, orders } = useOrders();
  const { brandInfo, isLoading: isBrandLoading } = useBrand();
  const { currentUser, isAuthenticated, addAddress, updateAddress } = useAuth();
  const { promotions } = usePromotions();
  
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | undefined>();
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();
  const [cookingNotes, setCookingNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClearCartAlertOpen, setClearCartAlertOpen] = useState(false);
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isDeliverySupported, setIsDeliverySupported] = useState(true);
  const [isAddressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);


  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser?.addresses && currentUser.addresses.length > 0) {
      const currentAddresses = currentUser.addresses;
      const defaultAddress = currentAddresses.find(a => a.isDefault) || currentAddresses[0];

      if (!selectedAddressId || !currentAddresses.some(a => a.id === selectedAddressId)) {
        setSelectedAddressId(defaultAddress.id);
      }
    } else {
      setSelectedAddressId(undefined);
    }
  }, [currentUser, selectedAddressId]);
  
  const customerType = useMemo(() => {
    if (!isAuthenticated || !currentUser) return 'new';
    const hasOrders = orders.some(order => order.customerId === currentUser.id);
    return hasOrders ? 'existing' : 'new';
  }, [isAuthenticated, currentUser, orders]);

  const selectedAddress = currentUser?.addresses?.find(a => a.id === selectedAddressId);
  
  useEffect(() => {
    if (selectedAddress && brandInfo?.deliveryAreas) {
        const area = brandInfo.deliveryAreas.find(da => da.pincode === selectedAddress.pincode);
        if (area) {
            setDeliveryFee(area.cost);
            setIsDeliverySupported(true);
        } else {
            setDeliveryFee(0);
            setIsDeliverySupported(false);
        }
    } else {
        // Default case if no address is selected or no delivery areas are defined
        setDeliveryFee(0);
        setIsDeliverySupported(true); // Assume support until an address proves otherwise
    }
  }, [selectedAddress, brandInfo?.deliveryAreas]);


  const handleApplyCoupon = () => {
    const promotion = promotions.find(p => p.couponCode.toUpperCase() === couponInput.toUpperCase());
    
    if (!promotion) {
      toast({ title: 'Invalid Coupon Code', variant: 'destructive' });
      return;
    }
    
    if (!promotion.isActive) {
      toast({ title: 'This coupon is not active.', variant: 'destructive' });
      return;
    }

    if (promotion.targetAudience !== 'all' && promotion.targetAudience !== customerType) {
        toast({ title: 'Coupon Not Applicable', description: 'This coupon is not valid for your account.', variant: 'destructive' });
        return;
    }

    if (promotion.minOrderValue && totalPrice < promotion.minOrderValue) {
        toast({ title: 'Minimum Spend Not Met', description: `You need to spend at least Rs.${promotion.minOrderValue} to use this coupon.`, variant: 'destructive' });
        return;
    }

    let calculatedDiscount = 0;
    if (promotion.discountType === 'percentage') {
        calculatedDiscount = totalPrice * (promotion.discountValue / 100);
    } else {
        calculatedDiscount = promotion.discountValue;
    }

    setDiscount(calculatedDiscount);
    setAppliedPromotion(promotion);
    toast({ title: 'Coupon Applied!', description: promotion.title });
  }

  const handleRemoveCoupon = () => {
    setCouponInput('');
    setAppliedPromotion(null);
    setDiscount(0);
    toast({ title: 'Coupon Removed' });
  }

  const handleSaveAddress = async (data: Address) => {
    if (data.id) {
        await updateAddress(data);
    } else {
        const { id, isDefault, ...newAddressData } = data;
        await addAddress(newAddressData);
    }
  }

  const handleEditAddress = (address: Address) => {
      setEditingAddress(address);
      setAddressDialogOpen(true);
  }
  
  if (isBrandLoading) {
    return (
      <div>
        <h1 className="text-4xl font-headline font-bold text-center mb-10 text-white">Checkout</h1>
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 md:gap-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8 lg:sticky top-24 h-fit">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Skeleton className="h-12 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!brandInfo) {
    return (
        <div className="text-center py-10">
            <p className="text-muted-foreground">Could not load restaurant information.</p>
        </div>
    );
  }
  
  const isClosed = brandInfo.businessHours.status === 'closed';
  const isProfileIncomplete = isAuthenticated && !currentUser?.phone;
  const hasNoAddress = isAuthenticated && (!currentUser?.addresses || currentUser.addresses.length === 0);
  const isUserBlocked = isAuthenticated && currentUser ? (brandInfo.blockedCustomerEmails || []).includes(currentUser.email) : false;

  const finalTotal = Math.max(0, totalPrice - discount) + deliveryFee;

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

    if (isProfileIncomplete) {
       toast({
        title: "Profile Incomplete",
        description: "Please update your profile with your phone number.",
        variant: "destructive",
      });
      return;
    }
    
    if (hasNoAddress) {
       toast({
        title: "Address Required",
        description: "Please add a delivery address to continue.",
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
    
    if (!isDeliverySupported) {
        toast({ title: "Delivery Not Available", description: "Sorry, we do not deliver to your selected pincode.", variant: "destructive" });
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
    
    const newOrder = await addOrder(items, finalTotal, pickupDate, time, deliveryAddress, cookingNotes, appliedPromotion?.couponCode, discount > 0 ? discount : undefined, deliveryFee > 0 ? deliveryFee : undefined);

    if (newOrder) {
      clearCart();
      setCookingNotes('');
      setCouponInput('');
      setAppliedPromotion(null);
      setDiscount(0);
      router.push(`/orders/${newOrder.id}`);
    } else {
        // Handle case where order creation failed before notifications (e.g., user not logged in)
        setIsProcessing(false);
    }
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
    <>
      <div>
        <h1 className="text-4xl font-headline font-bold text-center mb-10 text-white">Checkout</h1>
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
                            setPickupDate(newDate || undefined);
                            setCalendarOpen(false);
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
                  <CardHeader>
                      <CardTitle>2. Select Delivery Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                      {isProfileIncomplete ? (
                          <Alert variant="destructive">
                              <User className="h-4 w-4" />
                              <AlertTitle>Phone Number Required</AlertTitle>
                              <AlertDescription className="flex justify-between items-center">
                              <span>Please add a phone number to your profile.</span>
                              <Button asChild variant="secondary" size="sm">
                                  <Link href="/profile">Update Profile</Link>
                              </Button>
                              </AlertDescription>
                          </Alert>
                      ) : hasNoAddress ? (
                          <Alert>
                              <Home className="h-4 w-4" />
                              <AlertTitle>No Address Found</AlertTitle>
                              <AlertDescription className="flex justify-between items-center">
                                  <span>You don't have any saved addresses.</span>
                                  <Button onClick={() => { setEditingAddress(null); setAddressDialogOpen(true); }} variant="secondary" size="sm">
                                      <PlusCircle className="mr-2 h-4 w-4" />
                                      Add Address
                                  </Button>
                              </AlertDescription>
                          </Alert>
                      ) : (
                           <div className="space-y-4">
                                <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId} className="space-y-3">
                                  {(currentUser?.addresses || []).map(address => (
                                    <Label key={address.id} htmlFor={address.id!} className={cn("block cursor-pointer rounded-lg border p-4 transition-all", selectedAddressId === address.id && "border-primary ring-2 ring-primary")}>
                                       <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                              <RadioGroupItem value={address.id!} id={address.id!} />
                                              <div className="flex items-center gap-3">
                                                  <div className="shrink-0">
                                                      {address.label === 'Home' ? <Home className="h-5 w-5 text-muted-foreground" /> : <Building className="h-5 w-5 text-muted-foreground" />}
                                                  </div>
                                                  <div className="flex-1">
                                                      <p className="font-semibold">{address.label} {address.isDefault && <Badge variant="outline" className="font-medium ml-2">Default</Badge>}</p>
                                                      <p className="text-sm text-muted-foreground">{formatAddress(address)}</p>
                                                  </div>
                                              </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); handleEditAddress(address); }}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </Button>
                                       </div>
                                    </Label>
                                  ))}
                                </RadioGroup>
                                <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => { setEditingAddress(null); setAddressDialogOpen(true); }}
                                >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add a New Address
                                </Button>
                            </div>
                      )}
                      {selectedAddress && !isDeliverySupported && (
                          <Alert variant="destructive">
                              <AlertTitle>Delivery Not Available</AlertTitle>
                              <AlertDescription>
                                  Sorry, we do not deliver to your selected pincode ({selectedAddress.pincode}). Please choose another address.
                              </AlertDescription>
                          </Alert>
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
                <CardHeader>
                  <CardTitle>4. Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.length > 0 ? (
                      <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2">
                          {items.map(item => (
                              <div key={item.id} className="flex justify-between items-start gap-4 border-b pb-4 last:border-b-0">
                                  <div className="flex items-start gap-4 flex-1">
                                      <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md border" />
                                      <div className="flex-1">
                                          <p className="font-semibold">{item.name}</p>
                                          <p className="text-sm text-muted-foreground">Rs.{item.price.toFixed(2)}</p>
                                          <div className="flex items-center gap-2 mt-2">
                                              <Button
                                                  variant="outline"
                                                  size="icon"
                                                  className="h-8 w-8"
                                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                              >
                                                  <Minus className="h-4 w-4" />
                                              </Button>
                                              <Input
                                                  type="number"
                                                  readOnly
                                                  value={item.quantity}
                                                  className="h-8 w-12 text-center"
                                              />
                                              <Button
                                                  variant="outline"
                                                  size="icon"
                                                  className="h-8 w-8"
                                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                              >
                                                  <Plus className="h-4 w-4" />
                                              </Button>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="text-right flex flex-col items-end">
                                      <p className="font-semibold mb-1">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                                      <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeItem(item.id)}>
                                          <Trash2 className="h-4 w-4" />
                                      </Button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">Your cart is empty.</p>
                  )}
                  <Button asChild variant="outline" className="w-full">
                      <Link href="/menu">
                          <PlusCircle className="mr-2 h-4 w-4" /> Add More Items
                      </Link>
                  </Button>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2"><TicketPercent className="h-5 w-5"/> Apply Coupon</h4>
                    {appliedPromotion ? (
                      <div className="flex items-center justify-between p-2 bg-secondary rounded-md">
                          <div className="text-sm">
                              <p className="font-semibold text-secondary-foreground">Applied: "{appliedPromotion.couponCode}"</p>
                              <p className="text-muted-foreground">{appliedPromotion.title}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={handleRemoveCoupon}>
                              <X className="h-4 w-4" />
                          </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                          <Input 
                            placeholder="Enter coupon code" 
                            value={couponInput}
                            onChange={e => setCouponInput(e.target.value)}
                            disabled={items.length === 0}
                          />
                          <Button onClick={handleApplyCoupon} disabled={!couponInput || items.length === 0}>Apply</Button>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-1">
                      <div className="flex justify-between text-muted-foreground">
                          <p>Subtotal</p>
                          <p>Rs.{totalPrice.toFixed(2)}</p>
                      </div>
                      {deliveryFee > 0 && (
                          <div className="flex justify-between text-muted-foreground">
                              <p className="flex items-center gap-2"><Truck className="h-4 w-4" /> Delivery Fee</p>
                              <p>Rs.{deliveryFee.toFixed(2)}</p>
                          </div>
                      )}
                      {discount > 0 && (
                          <div className="flex justify-between text-success">
                              <p>Discount</p>
                              <p>- Rs.{discount.toFixed(2)}</p>
                          </div>
                      )}
                      <div className="flex justify-between font-bold text-xl">
                          <p>Total</p>
                          <p>Rs.{finalTotal.toFixed(2)}</p>
                      </div>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                   <div className="flex justify-end w-full">
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
                   </div>
                  <Button onClick={handlePlaceOrder} disabled={isProcessing || isClosed || hasNoAddress || isProfileIncomplete || items.length === 0 || isUserBlocked || !isDeliverySupported} size="lg" className="w-full">
                    {isProcessing ? 'Processing...' : `Place Pre-Order (Rs.${finalTotal.toFixed(2)})`}
                  </Button>
                </CardFooter>
              </Card>
          </div>
        </div>
      </div>
      <AddressDialog
        isOpen={isAddressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        onSave={handleSaveAddress}
        address={editingAddress}
      />
    </>
  );
}
