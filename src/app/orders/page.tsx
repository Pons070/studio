
"use client";

import { useState, useEffect } from 'react';
import { reviews as mockReviews } from '@/lib/mock-data';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Order, Review } from '@/lib/types';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useOrders } from '@/store/orders';

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
                            <p className="font-medium">Order Date</p>
                            <p className="text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="font-medium">Pickup Time</p>
                            <p className="text-muted-foreground">{order.pickupTime}</p>
                        </div>
                         <div>
                            <p className="font-medium">Status</p>
                            <Badge variant={getBadgeVariant(order.status)} className={cn(
                                order.status === 'Completed' && 'bg-green-600 text-white',
                                order.status === 'Confirmed' && 'bg-blue-500 text-white'
                              )}>{order.status}</Badge>
                        </div>
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
  const { toast } = useToast();
  const { orders, updateOrderStatus, addReviewToOrder } = useOrders();
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  const handleCancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'Cancelled');
  }

  const handleReviewSubmit = (orderId: string, rating: number, comment: string) => {
    const newReview: Review = {
        id: `REV-${Date.now()}`,
        orderId,
        customerName: 'Guest User', // Hardcoded for prototype
        rating,
        comment,
        date: new Date().toISOString().split('T')[0],
    };
    setReviews([...reviews, newReview]);
    addReviewToOrder(orderId, newReview.id);
    setReviewOrder(null);
    toast({
        title: "Review Submitted!",
        description: "Thank you for your valuable feedback.",
        className: "bg-green-500 text-white"
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">My Orders</CardTitle>
          <CardDescription>View your order history and manage upcoming pre-orders.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden sm:table-cell">Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="hidden sm:table-cell font-medium">{order.id}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(order.status)} className={cn(
                      order.status === 'Completed' && 'bg-green-600 text-white',
                      order.status === 'Confirmed' && 'bg-blue-500 text-white'
                    )}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">Rs.{order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>View Details</Button>
                    {order.status === 'Completed' && (
                      !order.reviewId ? (
                        <Button variant="default" size="sm" onClick={() => setReviewOrder(order)}>Leave Review</Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>Review Submitted</Button>
                      )
                    )}
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
