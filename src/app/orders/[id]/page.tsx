
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useOrders } from '@/store/orders';
import { useAuth } from '@/store/auth';
import type { Order } from '@/lib/types';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingBag, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { VariantProps } from 'class-variance-authority';

const getBadgeVariant = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Confirmed': return 'secondary';
    case 'Pending':   return 'outline';
    case 'Cancelled': return 'destructive';
    default:          return 'outline';
  }
};

export default function OrderConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const { orders } = useOrders();
    const { currentUser, isAuthenticated } = useAuth();
    const [order, setOrder] = useState<Order | null | undefined>(undefined); // undefined for loading

    const orderId = params.id as string;

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (orders.length > 0 && currentUser) {
            const foundOrder = orders.find(o => o.id === orderId && o.customerId === currentUser.id);
            setOrder(foundOrder || null); // null if not found
        }
    }, [orderId, orders, currentUser, isAuthenticated, router]);

    if (order === undefined) {
        return (
             <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (order === null) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
                <p className="text-muted-foreground mb-6">We couldn't find the order you're looking for, or it may not belong to you.</p>
                <Button asChild>
                    <Link href="/orders">View All My Orders</Link>
                </Button>
            </div>
        );
    }
    
    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center p-6 bg-success/10 border border-success/20 rounded-lg">
                <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                <h1 className="text-2xl md:text-3xl font-headline font-bold text-success">Thank You for Your Order!</h1>
                <p className="text-muted-foreground mt-2">
                    Your pre-order has been placed successfully. You can track its status below.
                </p>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>Order ID: {order.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="font-medium">Status</p>
                            <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
                        </div>
                        <div>
                            <p className="font-medium">Order Placed</p>
                            <p className="text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="font-medium">Pickup Date</p>
                            <p className="text-muted-foreground">{new Date(order.pickupDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="font-medium">Pickup Time</p>
                            <p className="text-muted-foreground">{order.pickupTime}</p>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h4 className="font-medium mb-4">Items Ordered</h4>
                        <div className="space-y-4">
                            {order.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <Image src={item.imageUrl || "https://placehold.co/64x64.png"} alt={item.name} width={56} height={56} className="rounded-md border" />
                                        <div>
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-medium">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <Separator />

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>Rs.{subtotal.toFixed(2)}</span>
                        </div>
                         {order.deliveryFee && order.deliveryFee > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Delivery Fee</span>
                                <span>Rs.{order.deliveryFee.toFixed(2)}</span>
                            </div>
                        )}
                         {order.discountAmount && (
                            <div className="flex justify-between text-success">
                                <span className="text-muted-foreground">Discount ({order.appliedCoupon})</span>
                                <span>- Rs.{order.discountAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-base">
                            <span>Total</span>
                            <span>Rs.{order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    {order.cookingNotes && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-medium">Cooking Notes</h4>
                                <p className="text-sm text-muted-foreground italic p-3 bg-muted/50 rounded-md mt-2">"{order.cookingNotes}"</p>
                            </div>
                        </>
                    )}

                </CardContent>
             </Card>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline" size="lg">
                    <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" /> View All My Orders</Link>
                </Button>
                <Button asChild size="lg">
                    <Link href="/menu"><ShoppingBag className="mr-2 h-4 w-4" /> Place Another Order</Link>
                </Button>
            </div>
        </div>
    );
}
