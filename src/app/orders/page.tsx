
"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import type { Order, Review } from '@/lib/types';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useOrders } from '@/store/orders';
import { useReviews } from '@/store/reviews';
import { useAuth } from '@/store/auth';
import Link from 'next/link';
import { useFavorites } from '@/store/favorites';
import { useCart } from '@/store/cart';
import { useBrand } from '@/store/brand';
import { RecommendButton } from '@/components/recommend-dialog';

const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Completed':
      return 'default';
    case 'Confirmed':
      return 'secondary';
    case 'Pending':
      return 'outline';
    case 'Cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

function OrderDetailsDialog({ order, isOpen, onOpenChange, reviews }: { order: Order | null; isOpen: boolean; onOpenChange: (open: boolean) => void; reviews: Review[] }) {
    if (!order) return null;

    const review = order.reviewId ? reviews.find(r => r.id === order.reviewId) : null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>
                        Order ID: {order.id}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-medium">Order Placed On</p>
                            <p className="text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="font-medium">Pre-Order Date</p>
                            <p className="text-muted-foreground">{new Date(order.pickupDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="font-medium">Pickup Time</p>
                            <p className="text-muted-foreground">{order.pickupTime}</p>
                        </div>
                         <div>
                            <p className="font-medium">Status</p>
                            <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
                        </div>
                        {order.cancellationDate && (
                          <>
                            <div>
                                <p className="font-medium">Cancelled On</p>
                                <p className="text-muted-foreground">{new Date(order.cancellationDate).toLocaleDateString()}</p>
                            </div>
                            {order.cancellationReason && (
                                <div className="col-span-2">
                                    <p className="font-medium">Reason for Cancellation</p>
                                    <p className="text-muted-foreground italic">"{order.cancellationReason}"</p>
                                </div>
                            )}
                          </>
                        )}
                        <div>
                            <p className="font-medium">Order Total</p>
                            <p className="font-bold">Rs.{order.total.toFixed(2)}</p>
                        </div>
                    </div>

                    <Separator />

                    <h4 className="font-medium">Items in this order</h4>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {order.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <Image src={item.imageUrl || "https://placehold.co/64x64.png"} alt={item.name} width={48} height={48} className="rounded-md" />
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p>Rs.{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {review && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-medium mb-2">Your Review</h4>
                                <div className="space-y-3 text-sm p-4 bg-muted/50 rounded-lg border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">Your Rating:</span>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={cn("h-4 w-4", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                                                ))}
                                            </div>
                                        </div>
                                         <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="italic">"{review.comment}"</p>
                                    {review.adminReply && (
                                        <div className="p-3 bg-background rounded-md mt-2 border-l-4 border-primary">
                                            <p className="font-semibold text-sm text-primary">Restaurant's Reply</p>
                                            <p className="text-muted-foreground text-sm italic">"{review.adminReply}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function StarRating({ rating, setRating }: { rating: number; setRating: (rating: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className="focus:outline-none"
          aria-label={`Rate ${star} stars`}
        >
          <Star className={cn(
            "h-8 w-8 transition-colors",
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-300"
          )} />
        </button>
      ))}
    </div>
  );
}

function ReviewDialog(
    { order, isOpen, onOpenChange, onSubmit }: 
    { order: Order | null; isOpen: boolean; onOpenChange: (open: boolean) => void; onSubmit: (orderId: string, rating: number, comment: string) => void }
) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setComment('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (order) {
            onSubmit(order.id, rating, comment);
        }
    };

    if (!order) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Leave a review for Order #{order.id}</DialogTitle>
                    <DialogDescription>
                        Your feedback helps us improve. Please rate your experience.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Your Rating</Label>
                        <StarRating rating={rating} setRating={setRating} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="comment">Your Comments</Label>
                        <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us about your experience..." />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={rating === 0}>Submit Review</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useOrders();
  const { reviews, addReview } = useReviews();
  const { currentUser, isAuthenticated } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const { toggleFavoriteOrder, isOrderFavorite } = useFavorites();
  const { reorder } = useCart();
  const { brandInfo } = useBrand();

  const handleCancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'Cancelled');
  }

  const handleReviewSubmit = (orderId: string, rating: number, comment: string) => {
    addReview(orderId, rating, comment);
    setReviewOrder(null);
  };
  
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareText = `I just had a great meal from ${brandInfo.name}! You should check them out for delicious pre-ordered meals.`;
  const shareTitle = `Recommend ${brandInfo.name}`;


  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">My Orders</CardTitle>
          <CardDescription>Please log in to view your orders.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center py-12">
            <p className="text-muted-foreground mb-4">You need to be logged in to see your order history.</p>
            <Button asChild>
                <Link href="/login">Log In</Link>
            </Button>
        </CardContent>
      </Card>
    )
  }

  const userOrders = orders.filter(order => order.customerId === currentUser?.id).sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">My Orders</CardTitle>
          <CardDescription>View your order history and manage upcoming pre-orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {userOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>You haven't placed any orders yet.</p>
               <Button asChild variant="link" className="mt-2 text-primary">
                <Link href="/menu">Browse the menu to get started!</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Order ID</TableHead>
                  <TableHead>Pickup Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="hidden sm:table-cell font-medium">{order.id}</TableCell>
                    <TableCell>{new Date(order.pickupDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">Rs.{order.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                       <div className="flex items-center justify-end space-x-1">
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>View</Button>
                          
                          {order.status !== 'Cancelled' && (
                            <Button variant="secondary" size="sm" onClick={() => reorder(order.items)}>Reorder</Button>
                          )}
                          
                          {order.status === 'Completed' ? (
                                !order.reviewId ? (
                                    <Button variant="default" size="sm" onClick={() => setReviewOrder(order)}>Review</Button>
                                ) : (
                                    <RecommendButton 
                                        shareUrl={shareUrl}
                                        shareTitle={shareTitle}
                                        shareText={shareText}
                                        size="sm"
                                        variant="outline"
                                        triggerText="Recommend"
                                    />
                                )
                            ) : null}
                          
                          {(order.status === 'Pending' || order.status === 'Confirmed') ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">Cancel</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently cancel your pre-order.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Go Back</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleCancelOrder(order.id)}>
                                    Yes, Cancel Order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : null}
                          
                          <Button variant="ghost" size="icon" onClick={() => toggleFavoriteOrder(order.id)}>
                            <Star className={cn("h-5 w-5 transition-colors", isOrderFavorite(order.id) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/60 hover:text-muted-foreground")} />
                            <span className="sr-only">Toggle Favorite</span>
                          </Button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <OrderDetailsDialog 
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrder(null);
          }
        }}
        reviews={reviews}
      />
      <ReviewDialog
        order={reviewOrder}
        isOpen={!!reviewOrder}
        onOpenChange={(open) => !open && setReviewOrder(null)}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}
