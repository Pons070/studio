

"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge, badgeVariants } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreHorizontal, PlusCircle, Trash2, Edit, Star, MessageSquare, Building, AlertTriangle, Search, Megaphone, Calendar as CalendarIcon, MapPin, Send, Palette, Check, Users, Shield, ClipboardList, Utensils } from 'lucide-react';
import type { Order, MenuItem, Review, BrandInfo, Address, UpdateRequest, Promotion, ThemeSettings, User } from '@/lib/types';
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
import { Switch } from '@/components/ui/switch';
import { useReviews } from '@/store/reviews';
import { Checkbox } from '@/components/ui/checkbox';
import { usePromotions } from '@/store/promotions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/store/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription
} from "@/components/ui/alert-dialog";
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

function ConversationThread({ requests }: { requests: UpdateRequest[] }) {
  if (!requests || requests.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Conversation</h4>
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
            <h4 className="font-medium">Reply to Customer</h4>
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

function OrderDetailsDialog({ order, isOpen, onOpenChange, reviews }: { order: Order | null; isOpen: boolean; onOpenChange: (open: boolean) => void; reviews: Review[] }) {
    if (!order) return null;

    const review = order.reviewId ? reviews.find(r => r.id === order.reviewId) : null;

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
                    <DialogTitle>Order Details</DialogTitle>
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
                     {order.cookingNotes && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="font-medium">Cooking Notes</h4>
                                <p className="text-sm text-muted-foreground italic p-2 bg-muted/50 rounded-md">"{order.cookingNotes}"</p>
                            </div>
                        </>
                    )}

                    <Separator />
                     <div className="space-y-2">
                        <h4 className="font-medium">Delivery Address</h4>
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
                                <h4 className="font-medium mb-2">Customer Review</h4>
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
                    <DialogTitle>Cancel Order #{order.id}</DialogTitle>
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


function OrderTable({ orders, onSelectOrder, onUpdateStatus, onCancelOrder, selectedOrders, onSelectedOrdersChange }: { orders: Order[], onSelectOrder: (order: Order) => void, onUpdateStatus: (orderId: string, status: Order['status']) => void, onCancelOrder: (order: Order) => void, selectedOrders: string[], onSelectedOrdersChange: (ids: string[]) => void }) {
  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground p-4">No orders to display.</p>;
  }

  const handleSelectAll = (checked: boolean) => {
    const allIds = orders.map(o => o.id);
    if (checked) {
        onSelectedOrdersChange([...new Set([...selectedOrders, ...allIds])]);
    } else {
        onSelectedOrdersChange(selectedOrders.filter(id => !allIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    onSelectedOrdersChange(
      checked
        ? [...selectedOrders, id]
        : selectedOrders.filter(orderId => orderId !== id)
    );
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">
            <Checkbox
              checked={orders.length > 0 && orders.every(o => selectedOrders.includes(o.id))}
              onCheckedChange={handleSelectAll}
              aria-label="Select all orders in this table"
            />
          </TableHead>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Pickup Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => {
          const lastMessage = order.updateRequests?.[(order.updateRequests?.length || 0) - 1];
          const hasInquiry = lastMessage?.from === 'customer';

          return (
            <TableRow key={order.id} data-state={selectedOrders.includes(order.id) ? "selected" : ""}>
                <TableCell>
                <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)}
                    aria-label={`Select order ${order.id}`}
                />
                </TableCell>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell className="flex items-center gap-2">
                   {order.customerName}
                   {hasInquiry && <MessageSquare className="h-4 w-4 text-primary animate-pulse" />}
                </TableCell>
                <TableCell>{new Date(order.pickupDate).toLocaleDateString()}</TableCell>
                <TableCell>
                <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right">Rs.{order.total.toFixed(2)}</TableCell>
                <TableCell>
                <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onSelectOrder(order)}>View Details</Button>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled={order.status === 'Pending'} onClick={() => onUpdateStatus(order.id, 'Pending')}>Set as Pending</DropdownMenuItem>
                        <DropdownMenuItem disabled={order.status === 'Confirmed'} onClick={() => onUpdateStatus(order.id, 'Confirmed')}>Set as Confirmed</DropdownMenuItem>
                        <DropdownMenuItem disabled={order.status === 'Completed'} onClick={() => onUpdateStatus(order.id, 'Completed')}>Set as Completed</DropdownMenuItem>
                        <DropdownMenuItem disabled={order.status === 'Cancelled'} className="text-destructive focus:bg-destructive/10" onClick={() => onCancelOrder(order)}>Set as Cancelled</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  )
}

function AdminNotificationDialog({ order, onOpenChange }: { order: Order | null; onOpenChange: (open: boolean) => void; }) {
    if (!order) return null;

    const lastMessage = order.updateRequests?.[order.updateRequests.length - 1];

    return (
        <Dialog open={!!order} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> New Inquiry on Order #{order.id}</DialogTitle>
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

function OrderManagement() {
  const { orders, updateOrderStatus, addUpdateRequest } = useOrders();
  const { reviews } = useReviews();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  
  // For new inquiry popup
  const [lastNotifiedMessageId, setLastNotifiedMessageId] = useState<string | null>(null);
  const [orderToShowInPopup, setOrderToShowInPopup] = useState<Order | null>(null);
  const prevOrdersRef = useRef<Order[]>([]);

  useEffect(() => {
    // Only check for new messages if the previous orders state is available
    if (prevOrdersRef.current.length > 0) {
      let latestCustomerMessage: { order: Order; messageId: string; timestamp: string; } | null = null;
      
      orders.forEach(order => {
        order.updateRequests?.forEach(req => {
            if (req.from === 'customer') {
                if (!latestCustomerMessage || new Date(req.timestamp) > new Date(latestCustomerMessage.timestamp)) {
                    latestCustomerMessage = { order, messageId: req.id, timestamp: req.timestamp };
                }
            }
        });
      });

      if (latestCustomerMessage && latestCustomerMessage.messageId !== lastNotifiedMessageId) {
          setOrderToShowInPopup(latestCustomerMessage.order);
          setLastNotifiedMessageId(latestCustomerMessage.messageId);
      }
    }
    prevOrdersRef.current = orders;
  }, [orders, lastNotifiedMessageId]);


  const handleConfirmCancellation = (orderId: string, reason: string) => {
    updateOrderStatus(orderId, 'Cancelled', reason);
  };

  const handleBulkUpdateStatus = (status: Order['status']) => {
    selectedOrderIds.forEach(id => {
      // Logic to prevent invalid status transitions can be added here
      updateOrderStatus(id, status);
    });
    setSelectedOrderIds([]);
  };

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeOrders = filteredOrders.filter(o => o.status === 'Pending' || o.status === 'Confirmed').sort((a, b) => new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime());
  const historicalOrders = filteredOrders.filter(o => o.status === 'Completed' || o.status === 'Cancelled').sort((a, b) => new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime());

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={selectedOrderIds.length === 0}>
              Bulk Actions ({selectedOrderIds.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleBulkUpdateStatus('Pending')}>Set as Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkUpdateStatus('Confirmed')}>Set as Confirmed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkUpdateStatus('Completed')}>Set as Completed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
            <CardDescription>Newly received and ongoing orders that require attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderTable 
              orders={activeOrders} 
              onSelectOrder={setSelectedOrder} 
              onUpdateStatus={updateOrderStatus} 
              onCancelOrder={setOrderToCancel}
              selectedOrders={selectedOrderIds}
              onSelectedOrdersChange={setSelectedOrderIds}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Completed and cancelled orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderTable 
              orders={historicalOrders} 
              onSelectOrder={setSelectedOrder} 
              onUpdateStatus={updateOrderStatus}
              onCancelOrder={setOrderToCancel}
              selectedOrders={selectedOrderIds}
              onSelectedOrdersChange={setSelectedOrderIds}
            />
          </CardContent>
        </Card>
      </div>
      <OrderDetailsDialog 
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        reviews={reviews}
      />
      <CancellationDialog
        order={orderToCancel}
        isOpen={!!orderToCancel}
        onOpenChange={(open) => !open && setOrderToCancel(null)}
        onConfirm={handleConfirmCancellation}
      />
      <AdminNotificationDialog
        order={orderToShowInPopup}
        onOpenChange={(open) => !open && setOrderToShowInPopup(null)}
      />
    </>
  );
}

type MenuItemFormData = Omit<MenuItem, 'id' | 'aiHint' | 'isAvailable' | 'isFeatured'> & { id?: string };

function MenuManagement() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const { toast } = useToast();

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  }

  const handleAddNew = () => {
    setSelectedItem(null);
    setDialogOpen(true);
  }
  
  const handleSave = (itemData: MenuItemFormData) => {
    const finalImageUrl = itemData.imageUrl || 'https://placehold.co/600x400.png';

    if (itemData.id) {
       const originalItem = menuItems.find(mi => mi.id === itemData.id);
       updateMenuItem({
         ...itemData,
         id: itemData.id,
         imageUrl: finalImageUrl,
         aiHint: itemData.name.toLowerCase(),
         isAvailable: originalItem?.isAvailable ?? true,
         isFeatured: originalItem?.isFeatured ?? false,
       });
     } else {
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

  const handleSelectAllMenu = (checked: boolean) => {
    setSelectedItemIds(checked ? filteredItems.map(i => i.id) : []);
  };

  const handleSelectMenuRow = (id: string, checked: boolean) => {
    setSelectedItemIds(
      checked
        ? [...selectedItemIds, id]
        : selectedItemIds.filter(itemId => itemId !== id)
    );
  };
  
  const handleBulkDelete = () => {
    selectedItemIds.forEach(id => deleteMenuItem(id));
    setSelectedItemIds([]);
  }

  const handleBulkAvailability = (isAvailable: boolean) => {
    const itemsToUpdate = menuItems.filter(item => selectedItemIds.includes(item.id));
    itemsToUpdate.forEach(item => {
        updateMenuItem({ ...item, isAvailable });
    });
    setSelectedItemIds([]);
  };

  const handleBulkFeature = (isFeatured: boolean) => {
    if (isFeatured) {
        const currentlyFeaturedCount = menuItems.filter(item => item.isFeatured).length;
        const newlySelectedToFeatureCount = selectedItemIds.filter(id => {
            const item = menuItems.find(item => item.id === id);
            return item && !item.isFeatured;
        }).length;

        if (currentlyFeaturedCount + newlySelectedToFeatureCount > 3) {
            toast({
                title: "Featured Item Limit Reached",
                description: `You can only feature a maximum of 3 items. You currently have ${currentlyFeaturedCount} and tried to add ${newlySelectedToFeatureCount}.`,
                variant: "destructive",
            });
            return;
        }
    }
    
    const itemsToUpdate = menuItems.filter(item => selectedItemIds.includes(item.id));
    itemsToUpdate.forEach(item => {
        updateMenuItem({ ...item, isFeatured });
    });
    setSelectedItemIds([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu Items</CardTitle>
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={selectedItemIds.length === 0}>
                        Bulk Actions ({selectedItemIds.length})
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAvailability(true)}>Set as Available</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAvailability(false)}>Set as Unavailable</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkFeature(true)}>Set as Featured</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkFeature(false)}>Set as Not Featured</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleBulkDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete Selected</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <div className="ml-auto">
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
              </Button>
            </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedItemIds.length === filteredItems.length && filteredItems.length > 0}
                  onCheckedChange={handleSelectAllMenu}
                  aria-label="Select all menu items"
                />
              </TableHead>
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
              <TableRow key={item.id} data-state={selectedItemIds.includes(item.id) ? "selected" : ""}>
                <TableCell>
                  <Checkbox
                    checked={selectedItemIds.includes(item.id)}
                    onCheckedChange={(checked) => handleSelectMenuRow(item.id, !!checked)}
                    aria-label={`Select item ${item.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>Rs.{item.price.toFixed(2)}</TableCell>
                <TableCell>
                    <Switch
                        checked={item.isAvailable}
                        onCheckedChange={(checked) => handleAvailabilityChange(item.id, checked)}
                        aria-label="Toggle item availability"
                    />
                </TableCell>
                <TableCell>
                    <Switch
                        checked={!!item.isFeatured}
                        onCheckedChange={(checked) => handleFeatureChange(item.id, checked)}
                        aria-label="Toggle featured status"
                    />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
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
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
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
      <MenuItemDialog 
        isOpen={isDialogOpen}
        setOpen={setDialogOpen}
        item={selectedItem}
        onSave={handleSave}
      />
    </Card>
  );
}

function MenuItemDialog({ isOpen, setOpen, item, onSave }: { isOpen: boolean, setOpen: (open: boolean) => void, item: MenuItem | null, onSave: (data: MenuItemFormData) => void }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState<MenuItem['category']>('Main Courses');
    const [imageUrl, setImageUrl] = useState('');

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
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        onSave({ id: item?.id, name, description, price, category, imageUrl });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                    <DialogDescription>
                        {item ? 'Make changes to the menu item here.' : 'Add a new item to your menu.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                    <DialogTitle>Reply to Review</DialogTitle>
                    <DialogDescription>
                        Respond to {review.customerName}'s feedback for order {review.orderId}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base">{review.customerName}</CardTitle>
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
                    <DialogTitle>Delete Review?</DialogTitle>
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
  const [isReplyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<Review | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

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
    deleteReview(reviewId);
    setReviewToDelete(null);
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
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
                  <TableCell>
                      <div className="font-medium">{review.customerName}</div>
                      <div className="text-xs text-muted-foreground">{review.orderId}</div>
                  </TableCell>
                  <TableCell>
                    <StarDisplay rating={review.rating} />
                  </TableCell>
                  <TableCell className="max-w-[300px] text-sm">
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
                      <Button variant="ghost" size="icon" onClick={() => handleReplyClick(review)}>
                          <MessageSquare className={cn("h-4 w-4", review.adminReply ? "text-primary fill-primary/20" : "")} />
                      </Button>
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
    </>
  );
}

const initialAddressState: Address = {
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
    fontHeadline: 'Alegreya',
    fontBody: 'Alegreya',
    borderRadius: 0.5,
    backgroundImageUrl: '',
};

function BrandManagement() {
  const { brandInfo, updateBrandInfo } = useBrand();
  const [name, setName] = useState(brandInfo.name);
  const [logoUrl, setLogoUrl] = useState(brandInfo.logoUrl);
  const [phone, setPhone] = useState(brandInfo.phone);
  const [address, setAddress] = useState<Address>(brandInfo.address || initialAddressState);
  const [about, setAbout] = useState(brandInfo.about || '');
  const [youtubeUrl, setYoutubeUrl] = useState(brandInfo.youtubeUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(brandInfo.instagramUrl || '');
  const [businessStatus, setBusinessStatus] = useState(brandInfo.businessHours.status);
  const [closureMessage, setClosureMessage] = useState(brandInfo.businessHours.message);
  const [allowOrderUpdates, setAllowOrderUpdates] = useState(brandInfo.allowOrderUpdates ?? true);
  const [theme, setTheme] = useState<ThemeSettings>(brandInfo.theme || initialThemeState);
  const [isSaving, setIsSaving] = useState(false);

  const palettes = [
    { name: 'Default Light', primaryColor: '222.2 47.4% 11.2%', backgroundColor: '0 0% 100%', accentColor: '210 40% 96.1%' },
    { name: 'Oceanic Blue', primaryColor: '217 91% 60%', backgroundColor: '210 40% 98%', accentColor: '198 93% 60%' },
    { name: 'Forest Green', primaryColor: '142 76% 36%', backgroundColor: '120 20% 97%', accentColor: '90 57% 53%' },
    { name: 'Royal Purple', primaryColor: '262 83% 58%', backgroundColor: '270 60% 98%', accentColor: '286 75% 68%' },
    { name: 'Modern Monochrome', primaryColor: '240 10% 3.9%', backgroundColor: '0 0% 100%', accentColor: '240 5% 65%' },
    { name: 'Sunset Orange', primaryColor: '24 94% 50%', backgroundColor: '20 50% 98%', accentColor: '35 91% 65%' },
    { name: 'Emerald & Black', primaryColor: '158 80% 30%', backgroundColor: '240 10% 3.9%', accentColor: '158 60% 50%' },
    { name: 'Charcoal & Gold', primaryColor: '45 85% 55%', backgroundColor: '220 15% 15%', accentColor: '45 65% 35%' },
    { name: 'Midnight Blue', primaryColor: '240 100% 95%', backgroundColor: '225 30% 10%', accentColor: '210 100% 70%' },
    { name: 'Slate & Crimson', primaryColor: '348 83% 47%', backgroundColor: '215 28% 17%', accentColor: '348 65% 60%' },
    { name: 'Lavender Bliss', primaryColor: '250 60% 55%', backgroundColor: '250 100% 99%', accentColor: '250 80% 90%' },
    { name: 'Peach & Cream', primaryColor: '25 85% 60%', backgroundColor: '35 100% 98%', accentColor: '30 90% 85%' },
    { name: 'Minty Fresh', primaryColor: '150 60% 45%', backgroundColor: '150 100% 98%', accentColor: '150 70% 80%' },
    { name: 'Sakura Pink', primaryColor: '340 80% 60%', backgroundColor: '340 100% 99%', accentColor: '340 90% 90%' },
    { name: 'Terracotta & Sage', primaryColor: '15 55% 45%', backgroundColor: '90 20% 97%', accentColor: '30 30% 80%' },
    { name: 'Sandy Beige', primaryColor: '35 30% 40%', backgroundColor: '45 60% 97%', accentColor: '40 40% 85%' },
    { name: 'Olive Grove', primaryColor: '80 40% 35%', backgroundColor: '90 30% 98%', accentColor: '75 25% 80%' },
    { name: 'Berry Blast', primaryColor: '310 70% 50%', backgroundColor: '320 100% 98%', accentColor: '300 80% 85%' },
    { name: 'Electric Lime', primaryColor: '75 80% 45%', backgroundColor: '80 100% 97%', accentColor: '70 90% 75%' },
    { name: 'Tropical Punch', primaryColor: '5 80% 55%', backgroundColor: '30 100% 98%', accentColor: '355 90% 80%' },
    { name: 'Rose Gold', primaryColor: '350 70% 60%', backgroundColor: '350 100% 99%', accentColor: '350 50% 85%' },
    { name: 'Wine & Dine', primaryColor: '345 60% 30%', backgroundColor: '345 100% 98%', accentColor: '345 40% 80%' },
    { name: 'Mustard & Teal', primaryColor: '180 60% 35%', backgroundColor: '45 100% 97%', accentColor: '40 80% 60%' },
    { name: 'Coffee House', primaryColor: '25 35% 30%', backgroundColor: '30 30% 96%', accentColor: '30 20% 80%' },
    { name: 'Sky Blue', primaryColor: '205 80% 55%', backgroundColor: '210 100% 98%', accentColor: '200 90% 85%' },
    { name: 'Ruby Red', primaryColor: '0 72% 51%', backgroundColor: '0 100% 98%', accentColor: '0 80% 85%' },
    { name: 'Graphite Dark', primaryColor: '210 40% 98%', backgroundColor: '224 71% 4%', accentColor: '217 33% 17%' },
    { name: 'Cinnamon Spice', primaryColor: '19 64% 45%', backgroundColor: '24 50% 97%', accentColor: '22 40% 85%' },
    { name: 'Faded Denim', primaryColor: '216 34% 47%', backgroundColor: '220 40% 97%', accentColor: '218 30% 80%' },
    { name: 'Autumn Glow', primaryColor: '38 92% 50%', backgroundColor: '30 60% 98%', accentColor: '45 80% 75%' },
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
    setName(brandInfo.name);
    setLogoUrl(brandInfo.logoUrl);
    setPhone(brandInfo.phone);
    setAddress(brandInfo.address || initialAddressState);
    setAbout(brandInfo.about || '');
    setYoutubeUrl(brandInfo.youtubeUrl || '');
    setInstagramUrl(brandInfo.instagramUrl || '');
    setBusinessStatus(brandInfo.businessHours.status);
    setClosureMessage(brandInfo.businessHours.message);
    setAllowOrderUpdates(brandInfo.allowOrderUpdates ?? true);
    setTheme(brandInfo.theme || initialThemeState);
  }, [brandInfo]);
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setAddress(prev => ({ ...prev, [id]: value }));
  }

  const handleThemeChange = (field: keyof ThemeSettings, value: string | number) => {
    setTheme(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'background') => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            if (field === 'logo') {
              setLogoUrl(result);
            } else {
              setTheme(prev => ({ ...prev, backgroundImageUrl: result }));
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    updateBrandInfo({
      name,
      logoUrl,
      phone,
      address,
      about,
      youtubeUrl,
      instagramUrl,
      businessHours: {
        status: businessStatus,
        message: closureMessage
      },
      allowOrderUpdates,
      theme,
    });
    // A little delay to simulate saving and show the disabled state
    setTimeout(() => setIsSaving(false), 500);
  }

  const isDirty = name !== brandInfo.name ||
    logoUrl !== brandInfo.logoUrl ||
    phone !== brandInfo.phone ||
    JSON.stringify(address) !== JSON.stringify(brandInfo.address) ||
    about !== (brandInfo.about || '') ||
    youtubeUrl !== (brandInfo.youtubeUrl || '') ||
    instagramUrl !== (brandInfo.instagramUrl || '') ||
    businessStatus !== brandInfo.businessHours.status ||
    (businessStatus === 'closed' && closureMessage !== brandInfo.businessHours.message) ||
    allowOrderUpdates !== (brandInfo.allowOrderUpdates ?? true) ||
    JSON.stringify(theme) !== JSON.stringify(brandInfo.theme || initialThemeState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Management</CardTitle>
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
        </div>
        
        <Separator />
        
        <div className="space-y-4">
            <Label className="text-base font-medium">Address</Label>
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
        <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
             <div className="flex items-center gap-4">
                {logoUrl ? (
                    <Image src={logoUrl} alt="Brand Logo" width={80} height={80} className="rounded-md border p-1" />
                ) : (
                    <div className="h-20 w-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                        <Building className="h-10 w-10" />
                    </div>
                )}
                <Input id="logo" type="file" onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" className="max-w-xs" />
            </div>
        </div>
        <Separator className="my-6" />
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Business Settings</h3>
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
          </div>
        </div>

        <Separator className="my-6" />
        
        <div className="space-y-6">
          <h3 className="text-lg font-medium flex items-center gap-2"><Palette /> Theme & Appearance</h3>
          <p className="text-sm text-muted-foreground">
            Customize the look and feel of your storefront. Choose a color palette, select fonts, and more.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label>Color Palette</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 pt-2">
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
            
            <div className="space-y-2">
              <Label htmlFor="backgroundImage">Background Image (Optional)</Label>
              <Input id="backgroundImage" type="file" onChange={(e) => handleFileChange(e, 'background')} accept="image/*" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="fontHeadline">Headline Font</Label>
              <Select onValueChange={(value) => handleThemeChange('fontHeadline', value)} value={theme.fontHeadline}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Alegreya">Alegreya</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Merriweather">Merriweather</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                  </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="fontBody">Body Font</Label>
              <Select onValueChange={(value) => handleThemeChange('fontBody', value)} value={theme.fontBody}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Alegreya">Alegreya</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Merriweather">Merriweather</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="borderRadius">Corner Radius: {theme.borderRadius}rem</Label>
                <Slider id="borderRadius" min={0} max={2} step={0.1} value={[theme.borderRadius || 0.5]} onValueChange={([val]) => handleThemeChange('borderRadius', val)} />
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
  );
}

type PromotionFormData = Omit<Promotion, 'id'> & { id?: string };

function PromotionDialog({ isOpen, setOpen, item, onSave }: { isOpen: boolean, setOpen: (open: boolean) => void, item: Promotion | null, onSave: (data: PromotionFormData) => void }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState<Promotion['targetAudience']>('all');
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [activeDays, setActiveDays] = useState<number[]>([]);

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
            } else {
                setTitle('');
                setDescription('');
                setTargetAudience('all');
                setStartDate(undefined);
                setEndDate(undefined);
                setActiveDays([]);
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
            id: item?.id, 
            title, 
            description, 
            targetAudience, 
            isActive: item?.isActive ?? true,
            startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
            endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
            activeDays: activeDays.length > 0 ? activeDays : undefined,
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{item ? 'Edit Promotion' : 'Add New Promotion'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-title" className="text-right">Title</Label>
                        <Input id="promo-title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="promo-desc" className="text-right">Description</Label>
                        <Textarea id="promo-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
                    </div>
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
                </div>
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
      addPromotion(newPromoData);
    }
    setDialogOpen(false);
  };

  const handleStatusChange = (promo: Promotion, isActive: boolean) => {
    updatePromotion({ ...promo, isActive });
  };
  
  const targetAudienceMap = {
    all: 'All Users',
    new: 'New Customers',
    existing: 'Existing Customers'
  };

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate && !endDate) return "Always Active";
    
    // Add time to date to avoid timezone issues with new Date()
    const start = startDate ? format(new Date(`${startDate}T00:00:00`), 'MMM d, yyyy') : '';
    const end = endDate ? format(new Date(`${endDate}T00:00:00`), 'MMM d, yyyy') : '';

    if (start && end) return `${start} - ${end}`;
    if (start) return `Starts ${start}`;
    if (end) return `Ends ${end}`;
    return "Always Active";
  };
  
  const formatActiveDays = (days?: number[]) => {
    if (!days || days.length === 0 || days.length === 7) return "All Days";
    
    const sortedDays = [...days].sort();
    if (sortedDays.join(',') === '1,2,3,4,5') return "Weekdays";
    if (sortedDays.join(',') === '0,6') return "Weekends";

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return sortedDays.map(d => dayLabels[d]).join(', ');
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage Promotions</CardTitle>
          <CardDescription>Create and manage promotional offers for your customers.</CardDescription>
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
                <TableHead>Target</TableHead>
                <TableHead>Active Days</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">{promo.title}</TableCell>
                  <TableCell>{targetAudienceMap[promo.targetAudience]}</TableCell>
                  <TableCell>{formatActiveDays(promo.activeDays)}</TableCell>
                  <TableCell>{formatDateRange(promo.startDate, promo.endDate)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={promo.isActive}
                      onCheckedChange={(checked) => handleStatusChange(promo, checked)}
                      aria-label="Toggle promotion status"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(promo)}>
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
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
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
                    <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
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
                    <AlertDialogTitle>{isBlocking ? 'Block' : 'Unblock'} Customer?</AlertDialogTitle>
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

function CustomerDetailsDialog({ customer, orders, isOpen, onOpenChange }: { customer: User | null; orders: Order[]; isOpen: boolean; onOpenChange: (open: boolean) => void; }) {
    if (!customer) return null;

    const formatAddressString = (address: Address) => {
        return `${address.doorNumber}, ${address.apartmentName}${address.floorNumber ? `, ${address.floorNumber}` : ''}, ${address.area}, ${address.city} - ${address.pincode}`;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Customer Details</DialogTitle>
                    <DialogDescription>{customer.name} - {customer.email}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-6">
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                           <h4 className="font-medium">Contact Information</h4>
                           <p className="text-sm"><strong>Email:</strong> {customer.email}</p>
                           <p className="text-sm"><strong>Phone:</strong> {customer.phone || 'Not Provided'}</p>
                        </div>
                        <Separator />
                         <div className="space-y-2">
                            <h4 className="font-medium">Saved Addresses</h4>
                            {customer.addresses && customer.addresses.length > 0 ? (
                                <div className="space-y-3">
                                    {customer.addresses.map((addr, index) => (
                                        <div key={addr.id || index} className="text-sm p-3 border rounded-md bg-muted/50">
                                            <p className="font-semibold">{addr.label} {addr.isDefault && <Badge variant="secondary">Default</Badge>}</p>
                                            <p className="text-muted-foreground">{formatAddressString(addr)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No addresses saved.</p>}
                        </div>
                        <Separator />
                        <div className="space-y-2">
                           <h4 className="font-medium">Order History ({orders.length})</h4>
                            {orders.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell>{order.id}</TableCell>
                                                <TableCell>{new Date(order.pickupDate).toLocaleDateString()}</TableCell>
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
                <DialogFooter>
                    <DialogClose asChild><Button variant="secondary">Close</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function CustomerTable({ customers, onSelectCustomer, onDeleteCustomer, onToggleBlockStatus }: { customers: (User & { orderCount: number; isBlocked: boolean; })[]; onSelectCustomer: (customer: User) => void; onDeleteCustomer: (customer: User) => void; onToggleBlockStatus: (customer: User) => void; }) {
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
                    <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone || 'N/A'}</TableCell>
                        <TableCell>{customer.orderCount}</TableCell>
                        <TableCell>
                            {customer.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                           <Button variant="outline" size="sm" onClick={() => onSelectCustomer(customer)}>View</Button>
                           <Button variant="outline" size="sm" className="ml-2" onClick={() => onToggleBlockStatus(customer)}>
                               {customer.isBlocked ? 'Unblock' : 'Block'}
                           </Button>
                           <Button variant="ghost" size="icon" className="ml-2 text-destructive" onClick={() => onDeleteCustomer(customer)}>
                               <Trash2 className="h-4 w-4" />
                           </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function CustomerManagement() {
  const { users, deleteUserById } = useAuth();
  const { orders } = useOrders();
  const { brandInfo, blockCustomer, unblockCustomer } = useBrand();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<User | null>(null);
  const [customerToBlock, setCustomerToBlock] = useState<User | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const { toast } = useToast();

  const blockedEmails = brandInfo.blockedCustomerEmails || [];

  const customersWithOrderCount = users.map(user => ({
    ...user,
    orderCount: orders.filter(o => o.customerId === user.id).length,
    isBlocked: blockedEmails.includes(user.email)
  }));

  const filteredCustomers = customersWithOrderCount.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleConfirmDelete = () => {
    if (customerToDelete) {
        deleteUserById(customerToDelete.id);
        setCustomerToDelete(null);
    }
  };

  const handleToggleBlockStatus = (customer: User) => {
    if (customer.email === 'admin@example.com') {
      toast({ title: "Action Not Allowed", description: "You cannot block the primary admin account.", variant: "destructive"});
      return;
    }
    setIsBlocking(!blockedEmails.includes(customer.email));
    setCustomerToBlock(customer);
  };
  
  const handleConfirmBlock = () => {
    if (customerToBlock) {
        if (isBlocking) {
            blockCustomer(customerToBlock.email);
        } else {
            unblockCustomer(customerToBlock.email);
        }
        setCustomerToBlock(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
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
             onDeleteCustomer={setCustomerToDelete}
             onToggleBlockStatus={handleToggleBlockStatus}
           />
        </CardContent>
      </Card>
      <CustomerDetailsDialog
        customer={selectedCustomer}
        orders={orders.filter(o => o.customerId === selectedCustomer?.id)}
        isOpen={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
      />
      <DeleteCustomerDialog
         customer={customerToDelete}
         isOpen={!!customerToDelete}
         onOpenChange={(open) => !open && setCustomerToDelete(null)}
         onConfirm={handleConfirmDelete}
      />
      <BlockCustomerDialog
         customer={customerToBlock}
         isOpen={!!customerToBlock}
         onOpenChange={(open) => !open && setCustomerToBlock(null)}
         onConfirm={handleConfirmBlock}
         isBlocking={isBlocking}
      />
    </>
  );
}


export default function AdminDashboardPage() {
  const [activeView, setActiveView] = useState('dashboard');

  const navItems = [
    { id: 'orders', label: 'Manage Orders', description: "View and process all customer orders.", icon: ClipboardList },
    { id: 'menu', label: 'Manage Menu', description: "Add, edit, or remove menu items.", icon: Utensils },
    { id: 'reviews', label: 'Manage Reviews', description: "Moderate and reply to feedback.", icon: Star },
    { id: 'promotions', label: 'Manage Promotions', description: "Create and manage special offers.", icon: Megaphone },
    { id: 'brand', label: 'Manage Brand', description: "Customize your store's appearance.", icon: Palette },
    { id: 'customers', label: 'Manage Customers', description: "View and manage user accounts.", icon: Users },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'orders': return <OrderManagement />;
      case 'menu': return <MenuManagement />;
      case 'reviews': return <ReviewManagement />;
      case 'promotions': return <PromotionManagement />;
      case 'brand': return <BrandManagement />;
      case 'customers': return <CustomerManagement />;
      default: return null;
    }
  };

  const activeItem = navItems.find(item => item.id === activeView);

  if (activeView === 'dashboard') {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <header className="space-y-2">
            <h1 className="text-4xl font-headline font-bold text-white">Admin Dashboard</h1>
            <p className="mt-2 text-lg text-white font-bold">Manage &amp; Control at your finger tips</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4">
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
      </div>
    );
  }

  return (
      <div className="space-y-6 p-4 md:p-6">
        <header className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setActiveView('dashboard')}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Dashboard</span>
            </Button>
            <div>
                <h1 className="text-3xl font-headline font-bold text-white">{activeItem?.label}</h1>
                <p className="text-muted-foreground">{activeItem?.description}</p>
            </div>
        </header>

        <Separator />
        
        <div className="pt-2">
            {renderContent()}
        </div>
      </div>
  );
}
