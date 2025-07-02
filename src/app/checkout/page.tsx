"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/store/cart';
import { useOrders } from '@/store/orders';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handlePlaceOrder = async () => {
    if (!date || !time) {
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
    
    await addOrder(items, totalPrice, date, time);

    setIsProcessing(false);
    clearCart();
    router.push('/orders');
  };
  
  const availableTimes = ["12:00", "12:30", "13:00", "18:00", "18:30", "19:00", "19:30", "20:00"];

  return (
    <div>
        <h1 className="text-4xl font-headline font-bold text-center mb-10">Checkout</h1>
        <div className="grid lg:grid-cols-2 gap-12">
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>1. Select Pickup Time</CardTitle>
                        <CardDescription>Choose when you'd like to receive your order.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
                                className="rounded-md border"
                            />
                        </div>
                        <div className="flex-1">
                             <h3 className="text-lg font-medium mb-4">Available Times</h3>
                             <Select onValueChange={setTime} value={time}>
                                 <SelectTrigger>
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
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle>2. Order Summary</CardTitle>
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
                        <Button onClick={handlePlaceOrder} disabled={isProcessing} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                            {isProcessing ? 'Processing...' : 'Place Pre-Order'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
