
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge, badgeVariants } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreHorizontal, PlusCircle, Trash2, Edit, Star, MessageSquare, Building, AlertTriangle, Search, Megaphone, Calendar as CalendarIcon, MapPin, Send, Palette, Check, Users, Shield, ClipboardList, Utensils, LogOut, Home, BarChart2, DollarSign, Package, Lightbulb, CheckCircle, TrendingUp, List, Terminal, Activity, FileText, Ban, Printer, Download, TicketPercent, Gift, Truck, Eye, Phone, FileJson } from 'lucide-react';
import type { Order, MenuItem, Review, BrandInfo, Address, UpdateRequest, Promotion, ThemeSettings, User, DeliveryArea } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useOrders } from '@/store/orders';
import { useMenu } from '@/store/menu';
import { useBrand } from '@/store/brand';
import { Switch } from "@/components/ui/switch";
import { useReviews } from '@/store/reviews';
import { Checkbox } from "@/components/ui/checkbox";
import { usePromotions } from '@/store/promotions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/store/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription
} from "@/components/ui/alert-dialog";
import type { VariantProps } from 'class-variance-authority';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRouter } from 'next/navigation';
import { getBusinessInsights, type BusinessInsightsOutput } from '@/ai/flows/business-insights-flow';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getBadgeVariant = (status: string): VariantProps<typeof badgeVariants>["variant"] => {
    switch (status) {
        case 'Completed': return 'success';
        case 'Confirmed': return 'secondary';
        case 'Pending':   return 'outline';
        case 'Cancelled': return 'destructive';
        default:          return 'outline';
    }
};

function ConversationThread({ requests }: { requests: UpdateRequest[] }) {
  if (!requests || requests.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="font-medium font-headline">Conversation</h4>
      <ScrollArea className="h-48 w-full rounded-md border p-4">
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className={cn("flex flex-col", req.from === 'admin' ? 'items-end' : 'items-start')}>
              <div className={cn("rounded-lg px-4 py-2 max-w-sm", req.from === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <p className="text-sm">{req.message}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {req.from === 'admin' ? 'You' : 'Customer'} • {formatDistanceToNow(new Date(req.timestamp), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function AdminReplyForm({ orderId }: { orderId: string }) {
    const { addUpdateRequest } = useOrders();
    const [reply, setReply] = useState('');

    const handleReply = () => {
        if (!reply.trim()) return;
        addUpdateRequest(orderId, reply, 'admin');
        setReply('');
    };

    return (
        <div className="space-y-2 pt-4 border-t">
            <h4 className="font-medium font-headline">Reply to Customer</h4>
            <div className="flex gap-2">
                <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply here..."
                    className="flex-1"
                />
                <Button onClick={handleReply} size="icon" disabled={!reply.trim()}>
                    <Send />
                </Button>
            </div>
        </div>
    );
}

function OrderDetailsDialog({ order, isOpen, onOpenChange, reviews, onCancelOrder }: { order: Order | null; isOpen: boolean; onOpenChange: (open: boolean) => void; reviews: Review[]; onCancelOrder: (order: Order) => void; }) {
    if (!order) return null;

    const review = order.reviewId ? reviews.find(r => r.id === order.reviewId) : null;
    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const fullAddress = [
        order.address.doorNumber,
        order.address.apartmentName,
        order.address.floorNumber,
        order.address.area,
        order.address.city,
        order.address.state,
        order.address.pincode,
    ].filter(Boolean).join(', ');

    const mapsUrl = order.address.latitude && order.address.longitude
        ? `https://www.google.com/maps/search/?api=1&query=${order.address.latitude},${order.address.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
        
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-headline">Order Details</DialogTitle>
                    <DialogDescription>
                        Order ID: {order.id} | Customer: {order.customerName}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-6">
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
                                {order.cancelledBy && (
                                    <div>
                                        <p className="font-medium">Cancelled By</p>
                                        <p className="text-muted-foreground capitalize">{order.cancelledBy}</p>
                                    </div>
                                )}
                                {order.cancellationAction && (
                                     <div>
                                        <p className="font-medium">Customer Action</p>
                                        <p className="text-muted-foreground capitalize">{order.cancellationAction === 'refund' ? 'Refund Requested' : 'Food Donated'}</p>
                                    </div>
                                )}
                                {order.cancellationReason && (
                                     <div className="col-span-2">
                                        <p className="font-medium">Reason for Cancellation</p>
                                        <p className="text-muted-foreground italic">"{order.cancellationReason}"</p>
                                    </div>
                                )}
                           </>
                        )}
                        <div className="col-span-2">
                            <Separator />
                        </div>
                        <div className="col-span-2 space-y-2">
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
                    </div>
                     {order.cookingNotes && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-medium font-headline">Cooking Notes</h4>
                                <p className="text-sm text-muted-foreground italic p-2 bg-muted/50 rounded-md">"{order.cookingNotes}"</p>
                            </div>
                        </>
                    )}

                    <Separator />
                     <div className="space-y-2">
                        <h4 className="font-medium font-headline">Delivery Address</h4>
                        <div className="text-sm text-muted-foreground">
                            <p>{order.address.doorNumber}, {order.address.apartmentName}{order.address.floorNumber && `, ${order.address.floorNumber}`}</p>
                            <p>{order.address.area}</p>
                            <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                        </div>
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "mt-2")}>
                            <MapPin className="mr-2 h-4 w-4" />
                            View on Map
                        </a>
                    </div>
                    <Separator />

                    <h4 className="font-medium font-headline">Items in this order</h4>
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

                    {(order.updateRequests && order.updateRequests.length > 0) && (
                        <>
                            <Separator />
                            <ConversationThread requests={order.updateRequests} />
                            <AdminReplyForm orderId={order.id} />
                        </>
                    )}


                    {review && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-medium mb-2 font-headline">Customer Review</h4>
                                <div className="space-y-3 text-sm p-4 bg-muted/50 rounded-lg border">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">Rating:</span>
                                            <StarDisplay rating={review.rating} />
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
                </ScrollArea>
                <DialogFooter className="border-t pt-4">
                     {(order.status === 'Pending' || order.status === 'Confirmed') && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Cancel Order</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="font-headline">Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This will cancel the order. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onCancelOrder(order)}>
                                        Yes, Cancel Order
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
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

function CancellationDialog({ order, isOpen, onOpenChange, onConfirm }: { order: Order | null; isOpen: boolean; onOpenChange: (open: boolean) => void; onConfirm: (orderId: string, reason: string) => void }) {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setReason('');
        }
    }, [isOpen]);
    
    if (!order) return null;

    const handleConfirm = () => {
        if (reason.trim()) {
            onConfirm(order.id, reason);
            onOpenChange(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline">Cancel Order #{order.id}</DialogTitle>
                    <DialogDescription>
                        Please provide a reason for cancelling this order. This will be shared with the customer.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                    <Label htmlFor="cancellation-reason">Reason for Cancellation</Label>
                    <Textarea 
                        id="cancellation-reason" 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., Unable to source ingredients..."
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Go Back</Button>
                    </DialogClose>
                    <Button type="button" variant="destructive" onClick={handleConfirm} disabled={!reason.trim()}>Confirm Cancellation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


function OrderTable({ orders, onSelectOrder, onUpdateStatus, onDeleteOrder }: { orders: Order[], onSelectOrder: (order: Order) => void, onUpdateStatus?: (orderId: string, status: Order['status']) => void, onDeleteOrder: (order: Order) => void }) {
  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground p-4">No orders to display.</p>;
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Pickup Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const lastMessage = order.updateRequests?.[(order.updateRequests?.length || 0) - 1];
          const hasInquiry = lastMessage?.from === 'customer';

          return (
            <TableRow key={order.id} className="cursor-pointer" onClick={() => onSelectOrder(order)}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell className="flex items-center gap-2">
                   {order.customerName}
                   {hasInquiry && <MessageSquare className="h-4 w-4 text-primary animate-pulse" />}
                </TableCell>
                <TableCell>{new Date(order.pickupDate).toLocaleDateString()}</TableCell>
                <TableCell onClick={(e) => { if (onUpdateStatus) e.stopPropagation(); }}>
                   {onUpdateStatus ? (
                     <Select onValueChange={(value) => onUpdateStatus(order.id, value as Order['status'])} defaultValue={order.status}>
                       <SelectTrigger className="w-[140px]">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Pending">Pending</SelectItem>
                         <SelectItem value="Confirmed">Confirmed</SelectItem>
                         <SelectItem value="Completed">Completed</SelectItem>
                       </SelectContent>
                     </Select>
                   ) : (
                     <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
                   )}
                </TableCell>
                <TableCell className="text-right">Rs.{order.total.toFixed(2)}</TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    {(order.status === 'Pending' || order.status === 'Confirmed') && (
                       <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">Cancel</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="font-headline">Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will cancel the order. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDeleteOrder(order)}>
                                        Yes, Cancel Order
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    {order.status === 'Cancelled' && order.cancellationAction && (
                        <Badge variant="outline" className="capitalize font-normal pointer-events-none">
                            {order.cancellationAction === 'refund' ? 'Refund Req.' : 'Donated'}
                        </Badge>
                    )}
                </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  )
}

function InquiryNotificationDialog({ order, onOpenChange }: { order: Order | null; onOpenChange: (open: boolean) => void; }) {
    if (!order) return null;

    const lastMessage = order.updateRequests?.[order.updateRequests.length - 1];

    return (
        <Dialog open={!!order} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-headline flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> New Inquiry on Order #{order.id}</DialogTitle>
                    <DialogDescription>
                       From: {order.customerName}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    {lastMessage && (
                        <div className="p-3 bg-muted rounded-md border">
                            <p className="text-sm italic">"{lastMessage.message}"</p>
                            <p className="text-xs text-muted-foreground mt-2 text-right">{formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}</p>
                        </div>
                    )}
                    <AdminReplyForm orderId={order.id} />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function NewOrderNotificationDialog({ order, onOpenChange, onGoToOrders }: { order: Order | null; onOpenChange: (open: boolean) => void; onGoToOrders: () => void; }) {
    if (!order) return null;

    const handleGoToOrdersClick = () => {
        onGoToOrders();
        onOpenChange(false);
    };

    return (
        <Dialog open={!!order} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-headline flex items-center gap-2"><PlusCircle className="h-5 w-5 text-primary" /> New Pre-Order Received!</DialogTitle>
                    <DialogDescription>
                        Order ID: #{order.id} from {order.customerName}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="p-3 bg-muted rounded-md border">
                        <p className="font-semibold">Order Summary</p>
                        <p className="text-sm text-muted-foreground">
                            {order.items.length} item(s) totaling Rs.{order.total.toFixed(2)}.
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Scheduled for pickup on {new Date(`${order.pickupDate}T00:00:00`).toLocaleDateString()} at {order.pickupTime}.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
                    <Button onClick={handleGoToOrdersClick}>Go to Orders</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function OrderManagement() {
  const { orders, updateOrderStatus } = useOrders();
  const { reviews } = useReviews();
  const { users } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleConfirmCancellation = (order: Order) => {
    setOrderToCancel(order);
  };
  
  const confirmCancelAction = (orderId: string, reason: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const customer = users.find(u => u.id === order.customerId);
    updateOrderStatus(orderId, 'Cancelled', 'admin', reason, customer?.email);
    setOrderToCancel(null);
  }

  const filteredOrders = useMemo(() => orders.filter(o =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  ), [orders, searchQuery]);

  const activeOrders = useMemo(() => filteredOrders
    .filter(o => o.status === 'Pending' || o.status === 'Confirmed')
    .sort((a, b) => new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime()), [filteredOrders]);

  const { recentHistory, archivedOrders } = useMemo(() => {
    const historical = filteredOrders.filter(o => o.status === 'Completed' || o.status === 'Cancelled');
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    
    let recent: Order[] = [];
    let archived: Order[] = [];

    historical.forEach(order => {
      if (new Date(order.pickupDate) < fifteenDaysAgo) {
        archived.push(order);
      } else {
        recent.push(order);
      }
    });

    recent.sort((a, b) => new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime());

    if (recent.length > 100) {
      const toArchive = recent.splice(100);
      archived.push(...toArchive);
    }

    archived.sort((a, b) => new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime());

    return { recentHistory: recent, archivedOrders: archived };
  }, [filteredOrders]);


  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 md:flex-initial md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders by ID or customer..." 
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Active Orders</CardTitle>
            <CardDescription>Newly received and ongoing orders that require attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderTable 
              orders={activeOrders} 
              onSelectOrder={setSelectedOrder}
              onUpdateStatus={updateOrderStatus}
              onDeleteOrder={handleConfirmCancellation}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Order History</CardTitle>
            <CardDescription>Completed and cancelled orders. Older orders are automatically archived.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recent" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recent">Recent History</TabsTrigger>
                <TabsTrigger value="archive">Archive</TabsTrigger>
              </TabsList>
              <TabsContent value="recent" className="mt-4">
                <OrderTable 
                  orders={recentHistory} 
                  onSelectOrder={setSelectedOrder}
                  onDeleteOrder={handleConfirmCancellation}
                />
              </TabsContent>
              <TabsContent value="archive" className="mt-4">
                 <OrderTable 
                  orders={archivedOrders} 
                  onSelectOrder={setSelectedOrder}
                  onDeleteOrder={handleConfirmCancellation}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <OrderDetailsDialog 
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        reviews={reviews}
        onCancelOrder={handleConfirmCancellation}
      />
      <CancellationDialog
        order={orderToCancel}
        isOpen={!!orderToCancel}
        onOpenChange={(open) => !open && setOrderToCancel(null)}
        onConfirm={confirmCancelAction}
      />
    </>
  );
}

type MenuItemDialogSaveData = Omit<MenuItem, 'aiHint' | 'isAvailable' | 'isFeatured'> & { id?: string };

function MenuManagement() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  }

  const handleAddNew = () => {
    setSelectedItem(null);
    setDialogOpen(true);
  }
  
  const handleSave = (itemData: MenuItemDialogSaveData) => {
    const finalImageUrl = itemData.imageUrl || 'https://placehold.co/600x400.png';

    if (itemData.id) { // Editing existing item
       const existingItem = menuItems.find(i => i.id === itemData.id);
       if (!existingItem) return;

       updateMenuItem({
         ...existingItem, // Preserves isAvailable & isFeatured
         name: itemData.name,
         description: itemData.description,
         price: itemData.price,
         category: itemData.category,
         imageUrl: finalImageUrl,
         aiHint: itemData.name.toLowerCase(),
       });
     } else { // Adding new item
       const { id, ...newItemData } = itemData;
       addMenuItem({
         ...newItemData,
         imageUrl: finalImageUrl,
       });
     }
     setDialogOpen(false);
  }

  const handleAvailabilityChange = (itemId: string, isAvailable: boolean) => {
    const itemToUpdate = menuItems.find(item => item.id === itemId);
    if (itemToUpdate) {
        updateMenuItem({ ...itemToUpdate, isAvailable });
    }
  };

  const handleFeatureChange = (itemId: string, isFeatured: boolean) => {
    if (isFeatured) {
        const featuredCount = menuItems.filter(item => item.isFeatured).length;
        if (featuredCount >= 3) {
            toast({
                title: "Featured Item Limit Reached",
                description: "You can only feature a maximum of 3 items at a time.",
                variant: "destructive",
            });
            return;
        }
    }
    const itemToUpdate = menuItems.find(item => item.id === itemId);
    if (itemToUpdate) {
        updateMenuItem({ ...itemToUpdate, isFeatured });
    }
  };

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Menu Items</CardTitle>
          <CardDescription>Add, edit, or remove menu items. Toggle their availability and featured status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 md:flex-initial md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
              </div>
              <div className="ml-auto">
                <Button onClick={handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
                </Button>
              </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium cursor-pointer" onClick={() => handleEdit(item)}>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>Rs.{item.price.toFixed(2)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                      <Switch
                          checked={item.isAvailable}
                          onCheckedChange={(checked) => handleAvailabilityChange(item.id, checked)}
                          aria-label="Toggle availability"
                      />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                      <Switch
                          checked={!!item.isFeatured}
                          onCheckedChange={(checked) => handleFeatureChange(item.id, checked)}
                          aria-label="Toggle featured status"
                      />
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-headline">Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the menu item "{item.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMenuItem(item.id)} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <MenuItemDialog 
        isOpen={isDialogOpen}
        setOpen={setDialogOpen}
        item={selectedItem}
        onSave={handleSave}
      />
    </>
  );
}

function MenuItemCropDialog({
  isOpen, 
  onOpenChange, 
  imgSrc, 
  onSave, 
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void; 
  imgSrc: string; 
  onSave: (dataUrl: string) => void;
}) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        width / height, // aspect ratio
        width,
        height
      ),
      width,
      height
    );
    setCrop(newCrop);
  }

  const handleSaveCrop = () => {
    if (completedCrop && imgRef.current) {
      const dataUrl = getCroppedImgDataUrl(imgRef.current, completedCrop);
      onSave(dataUrl);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Crop Menu Item Image</DialogTitle>
          <DialogDescription>
            Adjust the selection to crop the image.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center my-4">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: '70vh' }}
              />
            </ReactCrop>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSaveCrop}>Save Image</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function MenuItemDialog({ isOpen, setOpen, item, onSave }: { isOpen: boolean, setOpen: (open: boolean) => void, item: MenuItem | null, onSave: (data: MenuItemDialogSaveData) => void }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState<MenuItem['category']>('Main Courses');
    const [imageUrl, setImageUrl] = useState('');
    
    const [isCropDialogOpen, setCropDialogOpen] = useState(false);
    const [imgSrcToCrop, setImgSrcToCrop] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (item) {
                setName(item.name);
                setDescription(item.description);
                setPrice(item.price);
                setCategory(item.category);
                setImageUrl(item.imageUrl);
            } else {
                setName('');
                setDescription('');
                setPrice(0);
                setCategory('Main Courses');
                setImageUrl('');
            }
        }
    }, [item, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImgSrcToCrop(reader.result as string);
                setCropDialogOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        onSave({ id: item?.id, name, description, price, category, imageUrl });
    }

    return (
        <>
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-headline">{item ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                    <DialogDescription>
                        {item ? 'Make changes to the menu item here.' : 'Add a new item to your menu.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">Price</Label>
                        <Input id="price" type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Category</Label>
                         <Select onValueChange={(value: MenuItem['category']) => setCategory(value)} value={category}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Appetizers">Appetizers</SelectItem>
                                <SelectItem value="Main Courses">Main Courses</SelectItem>
                                <SelectItem value="Desserts">Desserts</SelectItem>
                                <SelectItem value="Drinks">Drinks</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">Image</Label>
                        <div className="col-span-3 space-y-2">
                          <Input id="image" type="file" onChange={handleFileChange} accept="image/*" />
                          {imageUrl && (
                              <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                                  <Image src={imageUrl} alt="Menu item preview" fill className="object-cover" />
                              </div>
                          )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <MenuItemCropDialog
            isOpen={isCropDialogOpen}
            onOpenChange={setCropDialogOpen}
            imgSrc={imgSrcToCrop}
            onSave={(dataUrl) => {
                setImageUrl(dataUrl);
                setCropDialogOpen(false);
            }}
        />
        </>
    )
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
}

function ReplyDialog({ review, isOpen, onOpenChange, onSave }: { review: Review | null; isOpen: boolean; onOpenChange: (open: boolean) => void; onSave: (reviewId: string, reply: string) => void }) {
    const [reply, setReply] = useState('');

    useEffect(() => {
        if (isOpen && review) {
            setReply(review.adminReply || '');
        }
    }, [review, isOpen]);

    const handleSubmit = () => {
        if (review) {
            onSave(review.id, reply);
        }
    }

    if (!review) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-headline">Reply to Review</DialogTitle>
                    <DialogDescription>
                        Respond to {review.customerName}'s feedback for order {review.orderId}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base font-headline">{review.customerName}</CardTitle>
                                    <CardDescription className="text-xs">{new Date(review.date).toLocaleDateString()}</CardDescription>
                                </div>
                                <StarDisplay rating={review.rating} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm italic">"{review.comment}"</p>
                        </CardContent>
                    </Card>
                    <div className="grid w-full gap-2">
                        <Label htmlFor="reply">Your Reply</Label>
                        <Textarea id="reply" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your response here..." />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit}>Save Reply</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function DeleteReviewDialog({ review, isOpen, onOpenChange, onConfirm }: { review: Review | null; isOpen: boolean; onOpenChange: (open: boolean) => void; onConfirm: (reviewId: string) => void }) {
    if (!review) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline">Delete Review?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this review from "{review.customerName}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                 <Card className="bg-muted/50 text-sm">
                    <CardContent className="p-4">
                        <p className="italic">"{review.comment}"</p>
                    </CardContent>
                </Card>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="button" variant="destructive" onClick={() => onConfirm(review.id)}>Yes, Delete Review</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ReviewManagement() {
  const { reviews, addAdminReply, togglePublishStatus, deleteReview } = useReviews();
  const { orders, updateOrderStatus } = useOrders();
  const { users } = useAuth();
  const [isReplyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<Review | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const handleSelectOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
    }
  };

  const handleConfirmCancellation = (order: Order) => {
    setSelectedOrder(null);
    setOrderToCancel(order);
  };
  
  const confirmCancelAction = (orderId: string, reason: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const customer = users.find(u => u.id === order.customerId);
    updateOrderStatus(orderId, 'Cancelled', 'admin', reason, customer?.email);
    setOrderToCancel(null);
  };

  const handleReplyClick = (review: Review) => {
    setSelectedReviewForReply(review);
    setReplyDialogOpen(true);
  };

  const handleSaveReply = (reviewId: string, reply: string) => {
    addAdminReply(reviewId, reply);
    setReplyDialogOpen(false);
  };

  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
  };

  const handleConfirmDelete = (reviewId: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      deleteReview(reviewId, review.orderId);
    }
    setReviewToDelete(null);
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Customer Reviews</CardTitle>
          <CardDescription>View, reply to, publish, or delete customer feedback.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell onClick={() => handleReplyClick(review)} className="cursor-pointer">
                      <div className="font-medium">{review.customerName}</div>
                      <div 
                        className="text-xs text-muted-foreground hover:underline"
                        onClick={(e) => { e.stopPropagation(); handleSelectOrder(review.orderId); }}
                      >
                        {review.orderId}
                      </div>
                  </TableCell>
                  <TableCell onClick={() => handleReplyClick(review)} className="cursor-pointer">
                    <StarDisplay rating={review.rating} />
                  </TableCell>
                  <TableCell className="max-w-[300px] text-sm cursor-pointer" onClick={() => handleReplyClick(review)}>
                      <p className="italic truncate">"{review.comment}"</p>
                       {review.adminReply && (
                        <div className="text-xs text-muted-foreground mt-1 pl-2 border-l-2">
                           <strong>Reply:</strong> {review.adminReply}
                        </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                        checked={review.isPublished}
                        onCheckedChange={() => togglePublishStatus(review.id)}
                        aria-label="Toggle review publication status"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(review)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ReplyDialog 
        review={selectedReviewForReply}
        isOpen={isReplyDialogOpen}
        onOpenChange={setReplyDialogOpen}
        onSave={handleSaveReply}
      />
      <DeleteReviewDialog
        review={reviewToDelete}
        isOpen={!!reviewToDelete}
        onOpenChange={(open) => !open && setReviewToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
       <OrderDetailsDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        reviews={reviews}
        onCancelOrder={handleConfirmCancellation}
      />
      <CancellationDialog
        order={orderToCancel}
        isOpen={!!orderToCancel}
        onOpenChange={(open) => !open && setOrderToCancel(null)}
        onConfirm={confirmCancelAction}
      />
    </>
  );
}

const initialAddressState: Omit<Address, 'id' | 'isDefault'> = {
    label: '',
    doorNumber: '',
    apartmentName: '',
    floorNumber: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
};

const initialThemeState: ThemeSettings = {
    primaryColor: '',
    backgroundColor: '',
    accentColor: '',
    cardColor: '',
    cardOpacity: 1,
    borderRadius: 0.5,
    backgroundImageUrl: '',
};

function getCroppedImgDataUrl(image: HTMLImageElement, crop: PixelCrop): string {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return '';
    }

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
    );
    
    return canvas.toDataURL('image/png');
}

function ImageCropDialog({ 
  isOpen, 
  onOpenChange, 
  imgSrc, 
  onSave, 
  shape,
  title
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void; 
  imgSrc: string; 
  onSave: (dataUrl: string) => void;
  shape?: 'square' | 'circle';
  title: string;
}) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const aspect = shape === 'square' ? 1 : undefined; // Allow free aspect for non-square
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        width,
        height
      ),
      width,
      height
    );
    setCrop(newCrop);
  }

  const handleSaveCrop = () => {
    if (completedCrop && imgRef.current) {
      const dataUrl = getCroppedImgDataUrl(imgRef.current, completedCrop);
      onSave(dataUrl);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">{title}</DialogTitle>
          <DialogDescription>
            Adjust the selection to crop your image.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center my-4">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={shape === 'square' ? 1 : undefined}
              circularCrop={shape === 'circle'}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: '70vh' }}
              />
            </ReactCrop>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSaveCrop}>Save Image</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeliveryAreaDialog({ isOpen, onOpenChange, onSave, area }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onSave: (data: DeliveryArea | Omit<DeliveryArea, 'id'>) => void, area: DeliveryArea | null }) {
    const [pincode, setPincode] = useState('');
    const [areaName, setAreaName] = useState('');
    const [cost, setCost] = useState(0);

    useEffect(() => {
        if (isOpen) {
            if (area) {
                setPincode(area.pincode);
                setAreaName(area.areaName);
                setCost(area.cost);
            } else {
                setPincode('');
                setAreaName('');
                setCost(0);
            }
        }
    }, [area, isOpen]);
    
    const handleSubmit = () => {
        const data = { pincode, areaName, cost };
        if (area) {
            onSave({ ...data, id: area.id });
        } else {
            onSave(data);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-headline">{area ? 'Edit Delivery Area' : 'Add New Delivery Area'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="pincode" className="text-right">Pincode</Label>
                        <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="areaName" className="text-right">Area Name</Label>
                        <Input id="areaName" value={areaName} onChange={(e) => setAreaName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cost" className="text-right">Cost (Rs.)</Label>
                        <Input id="cost" type="number" value={cost} onChange={(e) => setCost(parseFloat(e.target.value) || 0)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit}>Save Area</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function BrandManagement() {
  const { brandInfo, updateBrandInfo } = useBrand();
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [address, setAddress] = useState<Omit<Address, 'id' | 'isDefault'>>(initialAddressState);
  const [about, setAbout] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [businessStatus, setBusinessStatus] = useState('open');
  const [closureMessage, setClosureMessage] = useState('');
  const [allowOrderUpdates, setAllowOrderUpdates] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [theme, setTheme] = useState<ThemeSettings>(initialThemeState);
  const [isSaving, setIsSaving] = useState(false);
  const [logoShape, setLogoShape] = useState('square');
  
  const [isCropDialogOpen, setCropDialogOpen] = useState(false);
  const [imgSrcToCrop, setImgSrcToCrop] = useState('');
  const [cropType, setCropType] = useState<'logo' | 'background'>('logo');


  const palettes = [
    { name: 'Oceanic Blue', primaryColor: '217 91% 60%', backgroundColor: '210 40% 98%', accentColor: '198 93% 60%' },
    { name: 'Forest Green', primaryColor: '142 76% 36%', backgroundColor: '120 20% 97%', accentColor: '90 57% 53%' },
    { name: 'Royal Purple', primaryColor: '262 83% 58%', backgroundColor: '270 60% 98%', accentColor: '286 75% 68%' },
    { name: 'Mustard & Teal', primaryColor: '180 60% 35%', backgroundColor: '45 100% 97%', accentColor: '40 80% 60%' },
    { name: 'Autumn Glow', primaryColor: '38 92% 50%', backgroundColor: '30 60% 98%', accentColor: '45 80% 75%' },
  ];

  const festivePalettes = [
    { name: 'Diwali', primaryColor: '0 59% 41%', backgroundColor: '39 77% 95%', accentColor: '38 92% 50%' },
    { name: 'Christmas', primaryColor: '0 72% 51%', backgroundColor: '210 40% 98%', accentColor: '142 76% 36%' },
    { name: 'Holi', primaryColor: '322 89% 57%', backgroundColor: '0 0% 98%', accentColor: '187 85% 43%' },
    { name: 'Eid', primaryColor: '145 63% 42%', backgroundColor: '0 0% 100%', accentColor: '45 100% 51%' },
  ];

  const cardColorsPalette = [
    '0 0% 100%',     // White
    '240 5% 96%',    // Off-White (Cool)
    '30 50% 98%',    // Off-White (Warm)
    '220 13% 91%',   // Light Gray
    '215 20% 65%',   // Mid Gray
    '215 28% 17%',   // Dark Gray
    '222 84% 5%',    // Near Black
    '210 20% 96%',   // Subtle Blue
    '145 30% 95%',   // Subtle Green
    '45 50% 95%',    // Subtle Yellow
    '10 40% 96%',    // Subtle Red
    '260 40% 97%',   // Subtle Purple
  ];

  const handlePaletteSelect = (palette: typeof palettes[0]) => {
    setTheme(prev => ({
        ...prev,
        primaryColor: palette.primaryColor,
        backgroundColor: palette.backgroundColor,
        accentColor: palette.accentColor,
    }));
  };

  useEffect(() => {
    if (brandInfo) {
      setName(brandInfo.name || '');
      setLogoUrl(brandInfo.logoUrl || '');
      setPhone(brandInfo.phone || '');
      setAdminEmail(brandInfo.adminEmail || '');
      setAddress(brandInfo.address || initialAddressState);
      setAbout(brandInfo.about || '');
      setYoutubeUrl(brandInfo.youtubeUrl || '');
      setInstagramUrl(brandInfo.instagramUrl || '');
      setBusinessStatus(brandInfo.businessHours?.status || 'open');
      setClosureMessage(brandInfo.businessHours?.message || '');
      setAllowOrderUpdates(brandInfo.allowOrderUpdates ?? true);
      setShowAddress(brandInfo.showAddressInAbout ?? true);
      setShowPhone(brandInfo.showPhoneInAbout ?? true);
      setTheme(brandInfo.theme || initialThemeState);
      setLogoShape(brandInfo.logoShape || 'square');
    }
  }, [brandInfo]);
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setAddress(prev => ({ ...prev, [id]: value }));
  }

  const handleThemeChange = (field: keyof ThemeSettings, value: string | number) => {
    setTheme(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'background') => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setCropType(type);
            setImgSrcToCrop(reader.result as string);
            setCropDialogOpen(true);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!brandInfo) return;
    setIsSaving(true);
    await updateBrandInfo({
      ...brandInfo,
      name,
      logoUrl,
      logoShape: logoShape as 'square' | 'circle',
      phone,
      adminEmail,
      address,
      about,
      youtubeUrl,
      instagramUrl,
      businessHours: {
        status: businessStatus as 'open' | 'closed',
        message: closureMessage
      },
      allowOrderUpdates,
      showAddressInAbout: showAddress,
      showPhoneInAbout: showPhone,
      theme,
    });
    setIsSaving(false);
  }

  const isDirty = brandInfo ? (
    name !== brandInfo.name ||
    logoUrl !== brandInfo.logoUrl ||
    logoShape !== (brandInfo.logoShape || 'square') ||
    phone !== brandInfo.phone ||
    adminEmail !== brandInfo.adminEmail ||
    JSON.stringify(address) !== JSON.stringify(brandInfo.address) ||
    about !== (brandInfo.about || '') ||
    youtubeUrl !== (brandInfo.youtubeUrl || '') ||
    instagramUrl !== (brandInfo.instagramUrl || '') ||
    businessStatus !== (brandInfo.businessHours?.status || 'open') ||
    (businessStatus === 'closed' && closureMessage !== (brandInfo.businessHours?.message || '')) ||
    allowOrderUpdates !== (brandInfo.allowOrderUpdates ?? true) ||
    showAddress !== (brandInfo.showAddressInAbout ?? true) ||
    showPhone !== (brandInfo.showPhoneInAbout ?? true) ||
    JSON.stringify(theme) !== JSON.stringify(brandInfo.theme || initialThemeState)
  ) : false;

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Brand Management</CardTitle>
        <CardDescription>Update your restaurant's branding, contact information, and theme.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input id="brand-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="brand-phone">Phone Number</Label>
                <Input id="brand-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
             <div className="space-y-2 md:col-span-2">
                <Label htmlFor="admin-email">Admin Email for Notifications</Label>
                <Input id="admin-email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
            </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
            <h3 className="text-base font-medium font-headline">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="doorNumber">Door Number</Label>
                  <Input id="doorNumber" value={address.doorNumber} onChange={handleAddressChange} />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="apartmentName">Apartment/Building Name</Label>
                  <Input id="apartmentName" value={address.apartmentName} onChange={handleAddressChange} />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="floorNumber">Floor Number (Optional)</Label>
                  <Input id="floorNumber" value={address.floorNumber || ''} onChange={handleAddressChange} />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="area">Area Name</Label>
                  <Input id="area" value={address.area} onChange={handleAddressChange} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={address.city} onChange={handleAddressChange} />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={address.state} onChange={handleAddressChange} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" value={address.pincode} onChange={handleAddressChange} />
              </div>
            </div>
        </div>

        <Separator />

        <div className="space-y-2">
            <Label htmlFor="brand-about">About Section</Label>
            <Textarea id="brand-about" value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Tell your customers about your restaurant..." rows={4} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="brand-youtube">YouTube Channel URL</Label>
            <Input id="brand-youtube" type="url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/yourchannel" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="brand-instagram">Instagram Page URL</Label>
            <Input id="brand-instagram" type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/yourpage" />
        </div>

        <Separator />
        
        <div className="space-y-4">
            <h3 className="text-base font-medium font-headline">Logo & Branding</h3>
            <div className="flex items-start gap-6">
                 <div className="space-y-2 flex-1">
                    <Label htmlFor="logo">Logo</Label>
                    <div className="flex items-center gap-4">
                        {logoUrl ? (
                            <Image src={logoUrl} alt="Brand Logo" width={80} height={80} className={cn("border p-1 bg-muted", logoShape === 'circle' ? 'rounded-full' : 'rounded-md')} />
                        ) : (
                            <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                                <Building className="h-10 w-10" />
                            </div>
                        )}
                        <Input id="logo" type="file" onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" className="max-w-xs" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Logo Shape</Label>
                    <RadioGroup
                        value={logoShape}
                        onValueChange={(value: 'square' | 'circle') => setLogoShape(value)}
                        className="flex gap-4 pt-2"
                    >
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="square" id="square" />
                        <Label htmlFor="square">Square</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="circle" id="circle" />
                        <Label htmlFor="circle">Circle</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
        </div>
        
        <Separator className="my-6" />

        <div className="space-y-6">
          <h3 className="text-lg font-medium font-headline">Business & Page Settings</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 rounded-lg border p-4">
                <Switch
                id="allow-order-updates"
                checked={allowOrderUpdates}
                onCheckedChange={setAllowOrderUpdates}
                />
                <div className="grid gap-1.5 flex-1">
                    <Label htmlFor="allow-order-updates" className="text-base flex-grow cursor-pointer pt-0.5">
                        Enable Customer Inquiries
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        Allow customers to send messages about their active orders.
                    </p>
                </div>
            </div>
            <div className="flex items-start space-x-4 rounded-lg border p-4">
                <Switch
                  id="business-status"
                  checked={businessStatus === 'open'}
                  onCheckedChange={(checked) => setBusinessStatus(checked ? 'open' : 'closed')}
                />
                <div className="grid gap-1.5 flex-1">
                  <Label htmlFor="business-status" className="text-base flex-grow cursor-pointer pt-0.5">
                    {businessStatus === 'open' ? 'Open for Pre-Orders' : 'Closed for Pre-Orders'}
                  </Label>
                   <p className="text-sm text-muted-foreground">
                        Control whether customers can place new pre-orders.
                    </p>
                </div>
            </div>
            {businessStatus === 'closed' && (
                <div className="space-y-2 pl-4">
                  <Label htmlFor="closure-message">Closure Message</Label>
                  <Textarea
                    id="closure-message"
                    value={closureMessage}
                    onChange={(e) => setClosureMessage(e.target.value)}
                    placeholder="E.g., Closed for a private event."
                  />
                  <p className="text-sm text-muted-foreground">
                    This message will be shown to customers when you are closed.
                  </p>
                </div>
              )}
               <div className="flex items-start space-x-4 rounded-lg border p-4">
                <Switch id="show-address" checked={showAddress} onCheckedChange={setShowAddress} />
                <div className="grid gap-1.5 flex-1">
                    <Label htmlFor="show-address" className="text-base flex-grow cursor-pointer pt-0.5 flex items-center gap-2"><Eye/> Show Address</Label>
                    <p className="text-sm text-muted-foreground">Display restaurant address on the 'About Us' page.</p>
                </div>
            </div>
            <div className="flex items-start space-x-4 rounded-lg border p-4">
                <Switch id="show-phone" checked={showPhone} onCheckedChange={setShowPhone} />
                <div className="grid gap-1.5 flex-1">
                     <Label htmlFor="show-phone" className="text-base flex-grow cursor-pointer pt-0.5 flex items-center gap-2"><Phone/> Show Phone</Label>
                     <p className="text-sm text-muted-foreground">Display contact number on the 'About Us' page.</p>
                </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />
        
        <div className="space-y-6">
          <h3 className="text-lg font-medium flex items-center gap-2 font-headline"><Palette /> Theme & Appearance</h3>
          <p className="text-sm text-muted-foreground">
            Customize the look and feel of your storefront. Choose a color palette, select fonts, and more.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label>Color Palette</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pt-2">
                {palettes.map((palette) => {
                  const isSelected = theme.primaryColor === palette.primaryColor && theme.backgroundColor === palette.backgroundColor;
                  return (
                    <div key={palette.name} onClick={() => handlePaletteSelect(palette)} className="cursor-pointer group">
                      <div className="relative">
                        <div className={cn("rounded-md border-2 p-1 transition-all", isSelected ? 'border-primary shadow-lg' : 'border-card group-hover:border-border')}>
                          <div className="flex h-16 w-full rounded-sm overflow-hidden">
                            <div className="w-1/2" style={{ backgroundColor: `hsl(${palette.backgroundColor})` }} />
                            <div className="w-1/2 flex flex-col">
                              <div className="h-2/3" style={{ backgroundColor: `hsl(${palette.primaryColor})` }} />
                              <div className="h-1/3" style={{ backgroundColor: `hsl(${palette.accentColor})` }} />
                            </div>
                          </div>
                        </div>
                         {isSelected && (
                            <div className="absolute -top-2 -right-2 h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background">
                                <Check className="h-4 w-4" />
                            </div>
                        )}
                      </div>
                      <p className={cn("text-sm text-center mt-2 transition-colors", isSelected ? 'font-semibold text-primary' : 'text-muted-foreground group-hover:text-foreground')}>{palette.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-2 font-headline"><Gift /> Festive Themes</Label>
              <p className="text-sm text-muted-foreground -mt-1">
                Apply a special theme for festive occasions with one click.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pt-2">
                {festivePalettes.map((palette) => {
                  const isSelected = theme.primaryColor === palette.primaryColor && theme.backgroundColor === palette.backgroundColor;
                  return (
                    <div key={palette.name} onClick={() => handlePaletteSelect(palette)} className="cursor-pointer group">
                      <div className="relative">
                        <div className={cn("rounded-md border-2 p-1 transition-all", isSelected ? 'border-primary shadow-lg' : 'border-card group-hover:border-border')}>
                          <div className="flex h-16 w-full rounded-sm overflow-hidden">
                            <div className="w-1/2" style={{ backgroundColor: `hsl(${palette.backgroundColor})` }} />
                            <div className="w-1/2 flex flex-col">
                              <div className="h-2/3" style={{ backgroundColor: `hsl(${palette.primaryColor})` }} />
                              <div className="h-1/3" style={{ backgroundColor: `hsl(${palette.accentColor})` }} />
                            </div>
                          </div>
                        </div>
                         {isSelected && (
                            <div className="absolute -top-2 -right-2 h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background">
                                <Check className="h-4 w-4" />
                            </div>
                        )}
                      </div>
                      <p className={cn("text-sm text-center mt-2 transition-colors", isSelected ? 'font-semibold text-primary' : 'text-muted-foreground group-hover:text-foreground')}>{palette.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <h4 className="font-medium font-headline">Section Background</h4>
              <p className="text-sm text-muted-foreground">Customize the background color and transparency of cards and sections.</p>
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label>Card Color</Label>
                <div className="flex flex-wrap gap-3 pt-2">
                  {cardColorsPalette.map((colorHsl) => {
                    const isSelected = (theme.cardColor || '0 0% 100%') === colorHsl;
                    return (
                      <button
                        key={colorHsl}
                        type="button"
                        onClick={() => handleThemeChange('cardColor', colorHsl)}
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center",
                          isSelected ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-muted'
                        )}
                        style={{ backgroundColor: `hsl(${colorHsl})` }}
                        aria-label={`Select color ${colorHsl}`}
                      >
                        {isSelected && <Check className="h-4 w-4 text-primary-foreground mix-blend-difference" />}
                      </button>
                    );
                  })}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="cardOpacity">Card Opacity: {Math.round((theme.cardOpacity || 1) * 100)}%</Label>
                <Slider id="cardOpacity" min={0} max={1} step={0.05} value={[theme.cardOpacity || 1]} onValueChange={([val]) => handleThemeChange('cardOpacity', val)} />
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="borderRadius">Corner Radius: {theme.borderRadius || 0.5}rem</Label>
                <Slider id="borderRadius" min={0} max={2} step={0.1} value={[theme.borderRadius || 0.5]} onValueChange={([val]) => handleThemeChange('borderRadius', val)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="backgroundImage">Background Image (Optional)</Label>
              <Input id="backgroundImage" type="file" onChange={(e) => handleFileChange(e, 'background')} accept="image/*" />
              {theme.backgroundImageUrl && (
                  <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                      <Image src={theme.backgroundImageUrl} alt="Background preview" fill className="object-cover" />
                  </div>
              )}
            </div>
          </div>
        </div>

      </CardContent>
      <CardFooter>
          <Button onClick={handleSave} disabled={isSaving || !isDirty}>
              {isSaving ? 'Saving...' : 'Save All Changes'}
          </Button>
      </CardFooter>
    </Card>
      <ImageCropDialog
        isOpen={isCropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imgSrc={imgSrcToCrop}
        shape={cropType === 'logo' ? logoShape as 'square' | 'circle' : undefined}
        title={cropType === 'logo' ? 'Crop Your Logo' : 'Crop Background Image'}
        onSave={(dataUrl) => {
          if (cropType === 'logo') {
            setLogoUrl(dataUrl);
          } else {
            handleThemeChange('backgroundImageUrl', dataUrl);
          }
          setCropDialogOpen(false);
        }}
      />
    </>
  );
}

function DeliveryManagement() {
  const { brandInfo, addDeliveryArea, updateDeliveryArea, deleteDeliveryArea } = useBrand();
  const [isAreaDialogOpen, setAreaDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null);

  const handleEditArea = (area: DeliveryArea) => {
    setEditingArea(area);
    setAreaDialogOpen(true);
  }
  
  const handleAddNewArea = () => {
    setEditingArea(null);
    setAreaDialogOpen(true);
  }

  const handleSaveArea = (areaData: DeliveryArea | Omit<DeliveryArea, 'id'>) => {
    if ('id' in areaData && areaData.id) {
        updateDeliveryArea(areaData as DeliveryArea);
    } else {
        addDeliveryArea(areaData as Omit<DeliveryArea, 'id'>);
    }
    setAreaDialogOpen(false);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Delivery Areas & Costs</CardTitle>
          <CardDescription>Define where you deliver and set the corresponding fees.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Pincode</TableHead>
                      <TableHead>Area Name</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {(brandInfo?.deliveryAreas || []).map(area => (
                      <TableRow key={area.id}>
                          <TableCell>{area.pincode}</TableCell>
                          <TableCell>{area.areaName}</TableCell>
                          <TableCell>Rs.{area.cost.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleEditArea(area)}>
                                  <Edit className="h-4 w-4" />
                              </Button>
                               <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                          <Trash2 className="h-4 w-4" />
                                      </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                      <AlertDialogHeader>
                                          <AlertDialogTitle className="font-headline">Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                              This will remove the delivery area for "{area.areaName} - {area.pincode}".
                                          </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => deleteDeliveryArea(area.id)} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                  </AlertDialogContent>
                              </AlertDialog>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddNewArea}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Delivery Area
          </Button>
        </CardFooter>
      </Card>
      <DeliveryAreaDialog
        isOpen={isAreaDialogOpen}
        onOpenChange={setAreaDialogOpen}
        onSave={handleSaveArea}
        area={editingArea}
      />
    </>
  );
}

type PromotionFormData = Promotion;

function PromotionDialog({ isOpen, setOpen, item, onSave }: { isOpen: boolean, setOpen: (open: boolean) => void, item: Promotion | null, onSave: (data: PromotionFormData) => void }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState<Promotion['targetAudience']>('all');
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [activeDays, setActiveDays] = useState<number[]>([]);
    const [isActive, setIsActive] = useState(true);
    const [couponCode, setCouponCode] = useState('');
    const [discountType, setDiscountType] = useState<Promotion['discountType']>('percentage');
    const [discountValue, setDiscountValue] = useState(0);
    const [minOrderValue, setMinOrderValue] = useState(0);

    const daysOfWeek = [
        { id: 1, label: 'Mon' }, { id: 2, label: 'Tue' }, { id: 3, label: 'Wed' },
        { id: 4, label: 'Thu' }, { id: 5, label: 'Fri' }, { id: 6, label: 'Sat' },
        { id: 0, label: 'Sun' },
    ];

    useEffect(() => {
        if (isOpen) {
            if (item) {
                setTitle(item.title);
                setDescription(item.description);
                setTargetAudience(item.targetAudience);
                setStartDate(item.startDate ? new Date(item.startDate) : undefined);
                setEndDate(item.endDate ? new Date(item.endDate) : undefined);
                setActiveDays(item.activeDays || []);
                setIsActive(item.isActive);
                setCouponCode(item.couponCode);
                setDiscountType(item.discountType);
                setDiscountValue(item.discountValue ?? 0);
                setMinOrderValue(item.minOrderValue || 0);
            } else {
                setTitle('');
                setDescription('');
                setTargetAudience('all');
                setStartDate(undefined);
                setEndDate(undefined);
                setActiveDays([]);
                setIsActive(true);
                setCouponCode('');
                setDiscountType('percentage');
                setDiscountValue(0);
                setMinOrderValue(0);
            }
        }
    }, [item, isOpen]);

    const handleDayToggle = (dayId: number) => {
        setActiveDays(prev => 
            prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
        );
    }

    const handleSubmit = () => {
        onSave({ 
            id: item?.id || '',
            title, 
            description, 
            targetAudience, 
            isActive,
            couponCode,
            discountType,
            discountValue,
            minOrderValue: minOrderValue > 0 ? minOrderValue : undefined,
            startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
            endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
            activeDays: activeDays.length > 0 ? activeDays : undefined,
        });
        setOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">{item ? 'Edit Promotion' : 'Add New Promotion'}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-title" className="text-right">Title</Label>
                        <Input id="promo-title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-desc" className="text-right">Description</Label>
                        <Textarea id="promo-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
                    </div>
                    
                    <Separator />

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-coupon" className="text-right">Coupon Code</Label>
                        <Input id="promo-coupon" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="col-span-3" placeholder="e.g., WELCOME15" />
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Discount</Label>
                        <div className="col-span-3 grid gap-4">
                            <RadioGroup value={discountType} onValueChange={(v: 'percentage' | 'flat') => setDiscountType(v)} className="flex items-center">
                                <div className="flex items-center space-x-2">
                                <RadioGroupItem value="percentage" id="r-percentage" />
                                <Label htmlFor="r-percentage">Percentage (%)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                <RadioGroupItem value="flat" id="r-flat" />
                                <Label htmlFor="r-flat">Flat Amount (Rs.)</Label>
                                </div>
                            </RadioGroup>
                             <Input type="number" min="0" value={discountValue} onChange={(e) => setDiscountValue(Math.abs(parseFloat(e.target.value) || 0))} placeholder="e.g., 15 or 100" />
                        </div>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-min-order" className="text-right">Min. Order (Rs.)</Label>
                        <Input id="promo-min-order" type="number" min="0" value={minOrderValue} onChange={(e) => setMinOrderValue(Math.abs(parseFloat(e.target.value) || 0))} className="col-span-3" placeholder="0 for no minimum" />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-target" className="text-right">Target</Label>
                        <Select onValueChange={(value: Promotion['targetAudience']) => setTargetAudience(value)} value={targetAudience}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select an audience" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="new">New Customers</SelectItem>
                                <SelectItem value="existing">Existing Customers</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">Active Days</Label>
                        <div className="col-span-3">
                            <div className="flex flex-wrap gap-2">
                                {daysOfWeek.map(day => (
                                    <Button
                                        key={day.id}
                                        type="button"
                                        variant={activeDays.includes(day.id) ? 'secondary' : 'outline'}
                                        size="sm"
                                        onClick={() => handleDayToggle(day.id)}
                                        className="w-12"
                                    >
                                        {day.label}
                                    </Button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Leave blank to run on all days.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-start-date" className="text-right">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "col-span-3 justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : <span>(Optional)</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-end-date" className="text-right">End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "col-span-3 justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : <span>(Optional)</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    disabled={{ before: startDate }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-active" className="text-right">Active</Label>
                        <div className="col-span-3">
                            <Switch id="promo-active" checked={isActive} onCheckedChange={setIsActive} />
                        </div>
                    </div>
                </div>
                </ScrollArea>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function PromotionManagement() {
  const { promotions, addPromotion, updatePromotion, deletePromotion } = usePromotions();
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleEdit = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedPromotion(null);
    setDialogOpen(true);
  };

  const handleSave = (promoData: PromotionFormData) => {
    if (promoData.id) {
      updatePromotion(promoData as Promotion);
    } else {
      const { id, ...newPromoData } = promoData;
      addPromotion(newPromoData as Omit<Promotion, 'id'>);
    }
    setDialogOpen(false);
  };
  
  const targetAudienceMap = {
    all: 'All Users',
    new: 'New Customers',
    existing: 'Existing Customers'
  };
  
  const formatDiscount = (promo: Promotion) => {
    const value = promo.discountValue ?? 0;
    if (promo.discountType === 'percentage') {
        return `${value}%`;
    }
    return `Rs.${value.toFixed(2)}`;
  }


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Manage Promotions</CardTitle>
          <CardDescription>Create and manage special offers for your customers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-right mb-4">
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Promotion
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Coupon Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promo) => (
                <TableRow key={promo.id} onClick={() => handleEdit(promo)} className="cursor-pointer">
                  <TableCell className="font-medium">{promo.title}</TableCell>
                  <TableCell><Badge variant="outline">{promo.couponCode}</Badge></TableCell>
                  <TableCell>{formatDiscount(promo)}</TableCell>
                  <TableCell>
                     <Badge variant={promo.isActive ? 'success' : 'secondary'}>
                        {promo.isActive ? 'Active' : 'Inactive'}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-headline">Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the promotion "{promo.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deletePromotion(promo.id)} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PromotionDialog 
        isOpen={isDialogOpen}
        setOpen={setDialogOpen}
        item={selectedPromotion}
        onSave={handleSave}
      />
    </>
  );
}

function DeleteCustomerDialog({ customer, isOpen, onOpenChange, onConfirm }: { customer: User | null; isOpen: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; }) {
    if (!customer) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-headline">Delete Customer?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete the account for "{customer.name}"? This will permanently remove their profile and cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className={buttonVariants({ variant: "destructive" })}>
                        Yes, Delete Customer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function BlockCustomerDialog({ customer, isOpen, onOpenChange, onConfirm, isBlocking }: { customer: User | null; isOpen: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; isBlocking: boolean }) {
    if (!customer) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-headline">{isBlocking ? 'Block' : 'Unblock'} Customer?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to {isBlocking ? 'block' : 'unblock'} "{customer.name}"?
                        {isBlocking
                          ? ' This will prevent them from logging in, signing up with this email, or placing new orders.'
                          : ' They will be able to access their account and place orders again.'
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className={buttonVariants({ variant: isBlocking ? "destructive" : "secondary" })}>
                        {isBlocking ? 'Yes, Block Customer' : 'Yes, Unblock Customer'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function CustomerDetailsDialog({ customer, orders, isOpen, onOpenChange, onToggleBlockStatus, isBlocked, onSelectOrder }: { customer: User | null; orders: Order[]; isOpen: boolean; onOpenChange: (open: boolean) => void; onToggleBlockStatus: (customer: User) => void; isBlocked: boolean; onSelectOrder: (order: Order) => void; }) {
    if (!customer) return null;

    const formatAddressString = (address: Address) => {
        return `${address.doorNumber}, ${address.apartmentName}${address.floorNumber ? `, ${address.floorNumber}` : ''}, ${address.area}, ${address.city} - ${address.pincode}`;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">Customer Details</DialogTitle>
                    <DialogDescription>{customer.name} - {customer.email}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-6">
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                           <h4 className="font-medium font-headline">Contact Information</h4>
                           <p className="text-sm"><strong>Email:</strong> {customer.email}</p>
                           <p className="text-sm"><strong>Phone:</strong> {customer.phone || 'Not Provided'}</p>
                           <p className="text-sm">
                                <strong>Status:</strong> {isBlocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="success">Active</Badge>}
                           </p>
                        </div>
                        <Separator />
                         <div className="space-y-2">
                            <h4 className="font-medium font-headline">Saved Addresses</h4>
                            {customer.addresses && customer.addresses.length > 0 ? (
                                <div className="space-y-3">
                                    {customer.addresses.map((addr, index) => (
                                        <div key={addr.id || index} className="text-sm p-3 border rounded-md bg-muted/50">
                                            <p className="font-semibold">{addr.label} {addr.isDefault && <Badge variant="outline">Default</Badge>}</p>
                                            <p className="text-muted-foreground">{formatAddressString(addr)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No addresses saved.</p>}
                        </div>
                        <Separator />
                        <div className="space-y-2">
                           <h4 className="font-medium font-headline">Order History ({orders.length})</h4>
                            {orders.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Pickup Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map(order => (
                                            <TableRow key={order.id} onClick={() => onSelectOrder(order)} className="cursor-pointer">
                                                <TableCell>{order.id}</TableCell>
                                                <TableCell>{new Date(`${order.pickupDate}T00:00:00`).toLocaleDateString()}</TableCell>
                                                <TableCell><Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge></TableCell>
                                                <TableCell className="text-right">Rs.{order.total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : <p className="text-sm text-muted-foreground">No orders found for this customer.</p>}
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter className="justify-between pt-4 border-t">
                    <Button variant={isBlocked ? "secondary" : "destructive"} onClick={() => customer && onToggleBlockStatus(customer)}>
                        {isBlocked ? 'Unblock Customer' : 'Block Customer'}
                    </Button>
                    <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function CustomerTable({ customers, onSelectCustomer, onDeleteCustomer }: { customers: (User & { orderCount: number; isBlocked: boolean; })[]; onSelectCustomer: (customer: User) => void; onDeleteCustomer: (customer: User) => void; }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {customers.map(customer => (
                    <TableRow key={customer.id} onClick={() => onSelectCustomer(customer)} className="cursor-pointer">
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone || 'N/A'}</TableCell>
                        <TableCell>{customer.orderCount}</TableCell>
                        <TableCell>
                            {customer.isBlocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="success">Active</Badge>}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                   <Trash2 className="h-4 w-4" />
                               </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="font-headline">Delete Customer?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete the account for "{customer.name}"? This will permanently remove their profile and cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDeleteCustomer(customer)} className={buttonVariants({ variant: "destructive" })}>
                                        Yes, Delete Customer
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                           </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function CustomerManagement() {
  const { users, deleteUserById } = useAuth();
  const { orders, updateOrderStatus } = useOrders();
  const { reviews } = useReviews();
  const { brandInfo, blockCustomer, unblockCustomer } = useBrand();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const { toast } = useToast();

  const blockedEmails = brandInfo?.blockedCustomerEmails || [];

  const customersWithOrderCount = users.map(user => ({
    ...user,
    orderCount: orders.filter(o => o.customerId === user.id).length,
    isBlocked: blockedEmails.includes(user.email)
  }));

  const filteredCustomers = customersWithOrderCount.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleConfirmDelete = (customer: User) => {
    deleteUserById(customer.id);
  };

  const handleToggleBlockStatus = (customer: User) => {
    if (customer.email === 'admin@example.com') {
      toast({ title: "Action Not Allowed", description: "You cannot block the primary admin account.", variant: "destructive"});
      return;
    }
    
    if (blockedEmails.includes(customer.email)) {
        unblockCustomer(customer.email);
    } else {
        blockCustomer(customer.email);
    }
    setSelectedCustomer(null); // Close dialog after action
  };
  
  const handleConfirmCancellation = (order: Order) => {
    setSelectedOrder(null);
    setOrderToCancel(order);
  };
  
  const confirmCancelAction = (orderId: string, reason: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const customer = users.find(u => u.id === order.customerId);
    updateOrderStatus(orderId, 'Cancelled', 'admin', reason, customer?.email);
    setOrderToCancel(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Customer Management</CardTitle>
          <CardDescription>View, search, and manage your customer accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
             <div className="relative flex-1 md:flex-initial md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>
          </div>
          <CustomerTable
             customers={filteredCustomers}
             onSelectCustomer={setSelectedCustomer}
             onDeleteCustomer={handleConfirmDelete}
           />
        </CardContent>
      </Card>
      <CustomerDetailsDialog
        customer={selectedCustomer}
        orders={orders.filter(o => o.customerId === selectedCustomer?.id)}
        isOpen={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
        onToggleBlockStatus={handleToggleBlockStatus}
        isBlocked={!!selectedCustomer && blockedEmails.includes(selectedCustomer.email)}
        onSelectOrder={(order) => {
            setSelectedCustomer(null);
            setSelectedOrder(order);
        }}
      />
      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        reviews={reviews}
        onCancelOrder={handleConfirmCancellation}
      />
      <CancellationDialog
        order={orderToCancel}
        isOpen={!!orderToCancel}
        onOpenChange={(open) => !open && setOrderToCancel(null)}
        onConfirm={confirmCancelAction}
      />
    </>
  );
}

function CancellationReasonDetailsDialog({ details, isOpen, onOpenChange, onExport, onSelectOrder }: { details: { reason: string; orders: Order[] } | null; isOpen: boolean; onOpenChange: (open: boolean) => void; onExport: () => void; onSelectOrder: (order: Order) => void; }) {
    if (!details) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">Orders Cancelled Due To: "{details.reason}"</DialogTitle>
                    <DialogDescription>
                        A total of {details.orders.length} order(s) were cancelled for this reason.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Cancelled On</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {details.orders.map(order => (
                                <TableRow key={order.id} onClick={() => onSelectOrder(order)} className="cursor-pointer">
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>{order.customerName}</TableCell>
                                    <TableCell>{order.cancellationDate ? new Date(`${order.cancellationDate}T00:00:00`).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell className="text-right">Rs.{order.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={onExport}><Download className="mr-2 h-4 w-4" />Export to CSV</Button>
                    <DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function PincodeDetailsDialog({ details, isOpen, onOpenChange, onExport, onSelectOrder }: { details: { pincode: string; orders: Order[] } | null; isOpen: boolean; onOpenChange: (open: boolean) => void; onExport: () => void; onSelectOrder: (order: Order) => void; }) {
    if (!details) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">Orders for Pincode: "{details.pincode}"</DialogTitle>
                    <DialogDescription>
                        A total of {details.orders.length} order(s) were delivered to this pincode.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Pickup Date</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {details.orders.map(order => (
                                <TableRow key={order.id} onClick={() => onSelectOrder(order)} className="cursor-pointer">
                                    <TableCell>{order.id}</TableCell>
                                    <TableCell>{order.customerName}</TableCell>
                                    <TableCell>{order.pickupDate ? new Date(`${order.pickupDate}T00:00:00`).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell className="text-right">Rs.{order.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={onExport}><Download className="mr-2 h-4 w-4" />Export to CSV</Button>
                    <DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function MetricDetailsDialog({ details, isOpen, onOpenChange, onExport, onSelectOrder }: { details: { title: string; data: (Order[] | Review[]); type: 'orders' | 'reviews' } | null; isOpen: boolean; onOpenChange: (open: boolean) => void; onExport: () => void; onSelectOrder: (order: Order) => void; }) {
    if (!details) return null;

    const dateColumnHeader = details.title.includes('Cancelled') ? 'Cancelled On' : 'Pickup Date';

    const renderReviewRow = (review: Review) => (
         <TableRow key={review.id}>
            <TableCell>{review.customerName}</TableCell>
            <TableCell><StarDisplay rating={review.rating} /></TableCell>
            <TableCell className="max-w-xs truncate italic">"{review.comment}"</TableCell>
            <TableCell>{new Date(review.date).toLocaleDateString()}</TableCell>
        </TableRow>
    );

    const description = `Displaying ${details.data.length} record(s).`;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="font-headline">{details.title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    <Table>
                        <TableHeader>
                           {details.type === 'orders' ? (
                               <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>{dateColumnHeader}</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                           ) : (
                               <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Comment</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                           )}
                        </TableHeader>
                        <TableBody>
                            {details.data.map(item => {
                                if (details.type === 'orders') {
                                    const order = item as Order;
                                    const dateString = order.status === 'Cancelled' ? order.cancellationDate : order.pickupDate;
                                    return (
                                        <TableRow key={order.id} onClick={() => onSelectOrder(order)} className="cursor-pointer">
                                            <TableCell>{order.id}</TableCell>
                                            <TableCell>{order.customerName}</TableCell>
                                            <TableCell>{dateString ? new Date(`${dateString}T00:00:00`).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell><Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge></TableCell>
                                            <TableCell className="text-right">Rs.{order.total.toFixed(2)}</TableCell>
                                        </TableRow>
                                    );
                                }
                                return renderReviewRow(item as Review);
                            })}
                        </TableBody>
                    </Table>
                </ScrollArea>
                 <DialogFooter>
                    <Button variant="outline" onClick={onExport}><Download className="mr-2 h-4 w-4" />Export to CSV</Button>
                    <DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function AnalyticsAndReports() {
  const { orders, updateOrderStatus } = useOrders();
  const { menuItems } = useMenu();
  const { reviews } = useReviews();
  const { users } = useAuth();
  
  const [insights, setInsights] = useState<BusinessInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellationDetails, setCancellationDetails] = useState<{ reason: string; orders: Order[] } | null>(null);
  const [pincodeDetails, setPincodeDetails] = useState<{ pincode: string; orders: Order[] } | null>(null);
  const [metricDetails, setMetricDetails] = useState<{ title: string; data: (Order[] | Review[]); type: 'orders' | 'reviews' } | null>(null);
  const [fullySelectedOrder, setFullySelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const completedOrders = useMemo(() => orders.filter((o) => o.status === 'Completed'), [orders]);
  const cancelledOrders = useMemo(() => orders.filter((o) => o.status === 'Cancelled'), [orders]);
  const donatedOrders = useMemo(() => cancelledOrders.filter(o => o.cancellationAction === 'donate'), [cancelledOrders]);

  const stats = useMemo(() => {
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalCompletedOrders = completedOrders.length;
    const totalCancelledOrders = cancelledOrders.length;
    const averageOrderValue = totalCompletedOrders > 0 ? totalRevenue / totalCompletedOrders : 0;
    const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    const totalDiscounts = completedOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
    const totalDonatedOrders = donatedOrders.length;
    const totalDeliveryFees = completedOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

    return {
      totalRevenue,
      totalCompletedOrders,
      averageOrderValue,
      averageRating: averageRating.toFixed(1),
      totalReviews: reviews.length,
      totalCancelledOrders,
      totalDiscounts,
      totalDonatedOrders,
      totalDeliveryFees
    };
  }, [completedOrders, cancelledOrders, reviews, donatedOrders]);

  const salesByMonth = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    orders.forEach((order) => {
      if (order.status === 'Completed') {
        const month = format(parseISO(order.orderDate), 'MMM yyyy');
        if (!monthlyData[month]) {
          monthlyData[month] = 0;
        }
        monthlyData[month] += order.total;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    return sortedMonths.map((month) => ({
      name: month,
      revenue: monthlyData[month],
    }));
  }, [orders]);

  const itemPopularity = useMemo(() => {
    const itemCounts: { [key: string]: { name: string; count: number } } = {};
    menuItems.forEach(item => {
        itemCounts[item.id] = { name: item.name, count: 0 };
    });

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if(itemCounts[item.id]) {
            itemCounts[item.id].count += item.quantity;
        }
      });
    });

    return Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders, menuItems]);
  
  const cancellationReasons = useMemo(() => {
    const reasonCounts: { [key: string]: number } = {};
    orders
      .filter((o) => o.status === 'Cancelled' && o.cancellationReason)
      .forEach((order) => {
        const reason = order.cancellationReason!;
        if (!reasonCounts[reason]) {
          reasonCounts[reason] = 0;
        }
        reasonCounts[reason]++;
      });

    return Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);
  
    const ordersByPincode = useMemo(() => {
        const pincodeCounts: { [key: string]: number } = {};
        orders
          .filter(o => o.status === 'Completed')
          .forEach(order => {
              const pincode = order.address.pincode;
              if (!pincodeCounts[pincode]) {
                  pincodeCounts[pincode] = 0;
              }
              pincodeCounts[pincode]++;
          });
        
        return Object.entries(pincodeCounts)
          .map(([pincode, count]) => ({ pincode, count }))
          .sort((a, b) => b.count - a.count);
    }, [orders]);

  const handleConfirmCancellation = (order: Order) => {
    setFullySelectedOrder(null);
    setOrderToCancel(order);
  };
  
  const confirmCancelAction = (orderId: string, reason: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const customer = users.find(u => u.id === order.customerId);
    updateOrderStatus(orderId, 'Cancelled', 'admin', reason, customer?.email);
    setOrderToCancel(null);
  };
  
  const handleReasonClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
        const reason = data.activePayload[0].payload.reason;
        const filteredOrders = orders.filter(o => o.cancellationReason === reason);
        setCancellationDetails({ reason, orders: filteredOrders });
    }
  };

  const handlePincodeClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
        const pincode = data.activePayload[0].payload.pincode;
        const filteredOrders = orders.filter(o => o.address.pincode === pincode && o.status === 'Completed');
        setPincodeDetails({ pincode, orders: filteredOrders });
    }
  };

  const downloadCsv = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headers.map(fieldName => 
                JSON.stringify(row[fieldName] ?? '', (key, value) => value === null ? '' : value)
            ).join(',')
        )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleExport = (details: { title: string; data: (Order[] | Review[]); type: 'orders' | 'reviews' } | { reason: string; orders: Order[] } | { pincode: string; orders: Order[] }) => {
    let dataToExport: any[];
    let filename: string;

    if ('pincode' in details) {
        dataToExport = details.orders.map(o => ({
            order_id: o.id,
            customer_name: o.customerName,
            pickup_date: o.pickupDate,
            total: o.total,
            delivery_fee: o.deliveryFee?.toFixed(2) || '0.00'
        }));
        filename = `orders_pincode_${details.pincode}.csv`;
    } else if ('reason' in details) {
        dataToExport = details.orders.map(o => ({
            order_id: o.id,
            customer_name: o.customerName,
            cancelled_on: o.cancellationDate,
            total: o.total,
        }));
        filename = `cancelled_orders_${details.reason.replace(/\s+/g, '_').toLowerCase()}.csv`;
    } else {
        if (details.type === 'orders') {
            dataToExport = (details.data as Order[]).map(o => ({
                order_id: o.id,
                customer_name: o.customerName,
                pickup_date: o.pickupDate,
                status: o.status,
                subtotal: o.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2),
                delivery_fee: o.deliveryFee?.toFixed(2) || '0.00',
                discount_coupon: o.appliedCoupon || 'N/A',
                discount_amount: o.discountAmount?.toFixed(2) || '0.00',
                total: o.total.toFixed(2),
                cancelled_on: o.cancellationDate || 'N/A',
                cancelled_by: o.cancelledBy || 'N/A',
                cancellation_reason: o.cancellationReason || 'N/A'
            }));
        } else {
             dataToExport = (details.data as Review[]).map(r => ({
                customer_name: r.customerName,
                rating: r.rating,
                comment: r.comment,
                date: r.date
            }));
        }
        filename = `${details.title.replace(/\s+/g, '_').toLowerCase()}.csv`;
    }
    
    downloadCsv(dataToExport, filename);
  };
  
  const handleDownloadPdf = async () => {
    const input = document.getElementById('analytics-printable-area');
    if (input) {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;

      let imgWidth = pdfWidth - 20;
      let imgHeight = imgWidth / ratio;

      if (imgHeight > pdfHeight - 20) {
        imgHeight = pdfHeight - 20;
        imgWidth = imgHeight * ratio;
      }

      const x = (pdfWidth - imgWidth) / 2;
      const y = 10;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save('analytics-report.pdf');
    }
  };

  useEffect(() => {
    async function fetchInsights() {
      setIsLoading(true);
      setError(null);
      try {
        const allItems = menuItems.map(item => item.name);
        const soldItems = new Set(orders.flatMap(o => o.items.map(i => i.name)));
        const unsoldItems = allItems.filter(name => !soldItems.has(name));

        const insightsData = await getBusinessInsights({
          totalRevenue: stats.totalRevenue,
          totalOrders: stats.totalCompletedOrders,
          averageOrderValue: stats.averageOrderValue,
          totalReviews: stats.totalReviews,
          averageRating: parseFloat(stats.averageRating),
          bestSellingItems: itemPopularity.map(i => i.name),
          worstSellingItems: unsoldItems.length > 0 ? unsoldItems : ['None'],
          totalCancelledOrders: stats.totalCancelledOrders,
          cancellationReasonCounts: cancellationReasons,
        });
        setInsights(insightsData);
      } catch (e) {
        console.error("Failed to get business insights:", e);
        setError("Could not load AI-powered insights at this time.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchInsights();
  }, [stats, itemPopularity, menuItems, orders, cancellationReasons]);

  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <>
    <div className="flex justify-end">
        <Button onClick={handleDownloadPdf} variant="outline"><Download className="mr-2 h-4 w-4"/>Download PDF</Button>
    </div>
    <div id="analytics-printable-area" className="space-y-6 mt-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => completedOrders.length > 0 && setMetricDetails({ title: 'Completed Orders', data: completedOrders, type: 'orders' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs.{stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => completedOrders.length > 0 && setMetricDetails({ title: 'Completed Orders', data: completedOrders, type: 'orders' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <Package />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompletedOrders}</div>
          </CardContent>
        </Card>
         <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => cancelledOrders.length > 0 && setMetricDetails({ title: 'Cancelled Orders', data: cancelledOrders, type: 'orders' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
            <Ban />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCancelledOrders}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
            const discountedOrders = completedOrders.filter(o => o.discountAmount && o.discountAmount > 0);
            if (discountedOrders.length > 0) {
                setMetricDetails({ title: 'Orders with Discounts', data: discountedOrders, type: 'orders' });
            }
        }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
            <TicketPercent />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs.{stats.totalDiscounts.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
            const deliveryOrders = completedOrders.filter(o => o.deliveryFee && o.deliveryFee > 0);
            if (deliveryOrders.length > 0) {
                setMetricDetails({ title: 'Orders with Delivery Fees', data: deliveryOrders, type: 'orders' });
            }
        }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Fees</CardTitle>
            <Truck />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs.{stats.totalDeliveryFees.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <FileText />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs.{stats.averageOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => reviews.length > 0 && setMetricDetails({ title: 'All Reviews', data: reviews, type: 'reviews' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating} / 5</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => donatedOrders.length > 0 && setMetricDetails({ title: 'Donated Food Orders', data: donatedOrders, type: 'orders' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donated Orders</CardTitle>
            <Gift />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonatedOrders}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${value}`} />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload && payload.length ? (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="font-bold">{label}</p>
                        <p className="text-sm text-muted-foreground">Revenue: Rs.{payload[0].value.toFixed(2)}</p>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="revenue" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Top 5 Menu Items</CardTitle>
            <CardDescription>By quantity sold across all orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload && payload.length ? (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="font-bold">{payload[0].name}</p>
                        <p className="text-sm text-muted-foreground">Sold: {payload[0].value}</p>
                      </div>
                    ) : null
                  }
                />
                <Pie data={itemPopularity} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                  {itemPopularity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

       {ordersByPincode.length > 0 && (
        <Card className="lg:col-span-7">
            <CardHeader>
                <CardTitle className="font-headline">Completed Orders by Pincode</CardTitle>
                <CardDescription>Click on a bar to see the list of orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={ordersByPincode} onClick={handlePincodeClick}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="pincode" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                            content={({ active, payload, label }) =>
                            active && payload && payload.length ? (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <p className="font-bold">Pincode: {label}</p>
                                <p className="text-sm text-muted-foreground">Orders: {payload[0].value}</p>
                                </div>
                            ) : null
                            }
                        />
                        <Bar dataKey="count" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary/80 cursor-pointer" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      )}

       {cancellationReasons.length > 0 && (
          <Card>
              <CardHeader>
              <CardTitle className="font-headline">Cancellation Reasons</CardTitle>
              <CardDescription>Click on a bar to see the list of orders.</CardDescription>
              </CardHeader>
              <CardContent>
              <ResponsiveContainer width="100%" height={cancellationReasons.length * 50 + 30}>
                  <BarChart
                  layout="vertical"
                  data={cancellationReasons}
                  margin={{ top: 5, right: 20, left: 120, bottom: 5 }}
                  onClick={handleReasonClick}
                  >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                      dataKey="reason"
                      type="category"
                      width={120}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      interval={0}
                  />
                  <Tooltip
                      content={({ active, payload, label }) =>
                      active && payload && payload.length ? (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <p className="font-bold">{label}</p>
                          <p className="text-sm text-muted-foreground">Count: {payload[0].value}</p>
                          </div>
                      ) : null
                      }
                  />
                  <Bar dataKey="count" fill="currentColor" radius={[0, 4, 4, 0]} className="fill-destructive/80 cursor-pointer" barSize={30} />
                  </BarChart>
              </ResponsiveContainer>
              </CardContent>
          </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Lightbulb /> AI-Powered Business Insights</CardTitle>
            <CardDescription>Actionable recommendations based on your restaurant's data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            ) : error ? (
                <div className="text-destructive text-center py-8">{error}</div>
            ) : insights && (
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 font-headline"><Activity /> Executive Summary</h3>
                        <p className="text-muted-foreground mt-2">{insights.executiveSummary}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                             <h3 className="font-semibold flex items-center gap-2 font-headline"><CheckCircle /> Strengths</h3>
                             <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                {insights.strengths.map((s, i) => <li key={i}>{s}</li>)}
                             </ul>
                        </div>
                         <div className="space-y-2">
                             <h3 className="font-semibold flex items-center gap-2 font-headline"><TrendingUp /> Opportunities</h3>
                             <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                {insights.opportunities.map((o, i) => <li key={i}>{o}</li>)}
                             </ul>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2 font-headline"><Terminal /> Recommendations</h3>
                        <div className="space-y-4">
                            {insights.recommendations.map((rec, i) => (
                                <Card key={i} className="bg-muted/50">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="font-headline text-base">{rec.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
    <CancellationReasonDetailsDialog 
        details={cancellationDetails}
        isOpen={!!cancellationDetails}
        onOpenChange={(open) => !open && setCancellationDetails(null)}
        onExport={() => cancellationDetails && handleExport(cancellationDetails)}
        onSelectOrder={setFullySelectedOrder}
    />
     <PincodeDetailsDialog 
        details={pincodeDetails}
        isOpen={!!pincodeDetails}
        onOpenChange={(open) => !open && setPincodeDetails(null)}
        onExport={() => pincodeDetails && handleExport(pincodeDetails)}
        onSelectOrder={setFullySelectedOrder}
    />
     <MetricDetailsDialog 
        details={metricDetails}
        isOpen={!!metricDetails}
        onOpenChange={(open) => !open && setMetricDetails(null)}
        onExport={() => metricDetails && handleExport(metricDetails)}
        onSelectOrder={setFullySelectedOrder}
    />
    <OrderDetailsDialog
        order={fullySelectedOrder}
        isOpen={!!fullySelectedOrder}
        onOpenChange={(open) => !open && setFullySelectedOrder(null)}
        reviews={reviews}
        onCancelOrder={handleConfirmCancellation}
    />
    <CancellationDialog
        order={orderToCancel}
        isOpen={!!orderToCancel}
        onOpenChange={(open) => !open && setOrderToCancel(null)}
        onConfirm={confirmCancelAction}
      />
    </>
  );
}

function DataFileViewer() {
    const [activeTab, setActiveTab] = useState('brand.json');
    const [fileContent, setFileContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fileNames = ['brand.json', 'menu.json', 'orders.json', 'users.json', 'reviews.json', 'promotions.json', 'favorites.json'];

    useEffect(() => {
        const fetchFileContent = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await fetch(`/api/admin/data-files?fileName=${activeTab}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${activeTab}`);
                }
                const data = await response.json();
                if (data.success) {
                    setFileContent(JSON.stringify(data.content, null, 2));
                } else {
                    throw new Error(data.message);
                }
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFileContent();
    }, [activeTab]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Data File Viewer</CardTitle>
                <CardDescription>View the raw JSON data that powers your application.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        {fileNames.map(name => (
                            <TabsTrigger key={name} value={name}>{name}</TabsTrigger>
                        ))}
                    </TabsList>
                    <TabsContent value={activeTab} className="mt-4">
                        <Card className="bg-muted font-code text-sm">
                            <CardContent className="p-4">
                                {isLoading ? (
                                    <Skeleton className="h-64 w-full" />
                                ) : error ? (
                                    <p className="text-destructive">{error}</p>
                                ) : (
                                    <ScrollArea className="h-96">
                                      <pre><code>{fileContent}</code></pre>
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}


export default function AdminDashboardPage() {
  const [activeView, setActiveView] = useState('dashboard');
  const router = useRouter();
  const { orders } = useOrders();
  const { currentUser } = useAuth();


  const [orderToShowInInquiryPopup, setOrderToShowInInquiryPopup] = useState<Order | null>(null);
  const [newOrderInPopup, setNewOrderInPopup] = useState<Order | null>(null);
  
  const prevOrdersRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Serialize orders to compare states and prevent running on every render.
    const currentOrdersJson = JSON.stringify(orders);
    
    // On the first render, just store the initial state and do nothing.
    if (prevOrdersRef.current === null) {
      prevOrdersRef.current = currentOrdersJson;
      return;
    }
    
    // If orders haven't changed, do nothing.
    if (prevOrdersRef.current === currentOrdersJson) {
      return;
    }

    const prevOrders: Order[] = JSON.parse(prevOrdersRef.current);

    // --- New Order Detection ---
    const newOrders = orders.filter(o => !prevOrders.some(p => p.id === o.id));
    if (newOrders.length > 0) {
      const pendingNewOrders = newOrders.filter(o => o.status === 'Pending');
      if (pendingNewOrders.length > 0) {
        const mostRecentNewOrder = pendingNewOrders.sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0];
        setNewOrderInPopup(mostRecentNewOrder);
      }
    }
    
    // --- Inquiry Detection ---
    let latestCustomerMessage: { order: Order } | null = null;
    orders.forEach(currentOrder => {
        const prevOrder = prevOrders.find(p => p.id === currentOrder.id);
        // Only check for new messages in existing orders
        if (prevOrder && (currentOrder.updateRequests?.length || 0) > (prevOrder.updateRequests?.length || 0)) {
            const latestRequest = currentOrder.updateRequests![currentOrder.updateRequests!.length - 1];
            // If the newest message is from a customer, we notify
            if (latestRequest.from === 'customer') {
                latestCustomerMessage = { order: currentOrder };
            }
        }
    });

    if (latestCustomerMessage) {
      setOrderToShowInInquiryPopup(latestCustomerMessage.order);
    }
    
    // Update the ref for the next comparison
    prevOrdersRef.current = currentOrdersJson;
  }, [orders]);


  const handleLogout = () => {
    router.push('/admin/login');
  };

  const handleGoToHome = () => {
    router.push('/');
  };

  const handleGoToOrders = () => {
    setActiveView('orders');
  };

  const navItems = [
    { id: 'orders', label: 'Manage Orders', description: "View and process all customer orders.", icon: ClipboardList },
    { id: 'menu', label: 'Manage Menu', description: "Add, edit, or remove menu items.", icon: Utensils },
    { id: 'reviews', label: 'Manage Reviews', description: "Moderate and reply to feedback.", icon: Star },
    { id: 'promotions', label: 'Manage Promotions', description: "Create and manage special offers.", icon: Megaphone },
    { id: 'delivery', label: 'Manage Delivery', description: "Set up delivery zones and costs.", icon: Truck },
    { id: 'brand', label: 'Manage Brand', description: "Customize your store's appearance.", icon: Palette },
    { id: 'customers', label: 'Manage Customers', description: "View and manage user accounts.", icon: Users },
    { id: 'analytics', label: 'Analytics', description: "Gain insights into your business performance.", icon: BarChart2 },
    { id: 'data', label: 'Data Viewer', description: "Inspect the raw JSON data files.", icon: FileJson },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'orders': return <OrderManagement />;
      case 'menu': return <MenuManagement />;
      case 'reviews': return <ReviewManagement />;
      case 'promotions': return <PromotionManagement />;
      case 'delivery': return <DeliveryManagement />;
      case 'brand': return <BrandManagement />;
      case 'customers': return <CustomerManagement />;
      case 'analytics': return <AnalyticsAndReports />;
      case 'data': return <DataFileViewer />;
      default: return null;
    }
  };

  const activeItem = navItems.find(item => item.id === activeView);

  if (!currentUser || currentUser.email !== 'admin@example.com') {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <Shield className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-3xl font-bold font-headline">Access Denied</h1>
            <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
            <Button asChild className="mt-6">
                <Link href="/">Go to Homepage</Link>
            </Button>
        </div>
    );
  }

  if (activeView === 'dashboard') {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <header className="flex justify-between items-start">
            <div className="space-y-2">
                <h1 className="text-4xl font-headline font-bold text-foreground">Admin Dashboard</h1>
                <p className="mt-2 text-lg text-muted-foreground">Manage &amp; Control at your finger tips</p>
            </div>
             <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleGoToOrders}>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Manage Orders
                </Button>
                <Button variant="outline" onClick={handleGoToHome}>
                    <Home className="mr-2 h-4 w-4" />
                    Go to Home
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
            {navItems.map(item => (
                <Card 
                    key={item.id}
                    className="cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    onClick={() => setActiveView(item.id)}
                >
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-32">
                        <item.icon className="h-8 w-8 text-primary" />
                        <p className="font-semibold text-sm">{item.label}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
         <InquiryNotificationDialog
            order={orderToShowInInquiryPopup}
            onOpenChange={(open) => !open && setOrderToShowInInquiryPopup(null)}
          />
        <NewOrderNotificationDialog
            order={newOrderInPopup}
            onOpenChange={(open) => !open && setNewOrderInPopup(null)}
            onGoToOrders={handleGoToOrders}
        />
      </div>
    );
  }

  return (
      <div className="space-y-6 p-4 md:p-6">
        <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => setActiveView('dashboard')}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
                </Button>
                <div>
                    <h1 className="text-3xl font-headline font-bold text-foreground">{activeItem?.label}</h1>
                    <p className="text-muted-foreground">{activeItem?.description}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 {activeView !== 'orders' && (
                    <Button variant="outline" onClick={handleGoToOrders}>
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Manage Orders
                    </Button>
                )}
                <Button variant="outline" onClick={handleGoToHome}>
                    <Home className="mr-2 h-4 w-4" />
                    Go to Home
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </header>

        <Separator />
        
        <div className="pt-2">
            {renderContent()}
        </div>

        <InquiryNotificationDialog
            order={orderToShowInInquiryPopup}
            onOpenChange={(open) => !open && setOrderToShowInInquiryPopup(null)}
        />
        <NewOrderNotificationDialog
            order={newOrderInPopup}
            onOpenChange={(open) => !open && setNewOrderInPopup(null)}
            onGoToOrders={handleGoToOrders}
        />
      </div>
  );
}
    
