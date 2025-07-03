
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Edit, Home, Star, MessageSquare, Building, Quote, AlertTriangle, Instagram } from 'lucide-react';
import type { Order, MenuItem, Review, BrandInfo } from '@/lib/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useOrders } from '@/store/orders';
import { useMenu } from '@/store/menu';
import { useBrand } from '@/store/brand';
import { Switch } from '@/components/ui/switch';
import { useReviews } from '@/store/reviews';

const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Completed': return 'default';
        case 'Confirmed': return 'secondary';
        case 'Pending':   return 'outline';
        case 'Cancelled': return 'destructive';
        default:          return 'outline';
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
                        Order ID: {order.id} | Customer: Guest User
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
                            <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
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

function OrderTable({ orders, onSelectOrder, onUpdateStatus }: { orders: Order[], onSelectOrder: (order: Order) => void, onUpdateStatus: (orderId: string, status: Order['status']) => void }) {
  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground">No orders to display in this category.</p>;
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.id}</TableCell>
            <TableCell>Guest User</TableCell>
            <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
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
                    <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'Pending')}>Set as Pending</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'Confirmed')}>Set as Confirmed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'Completed')}>Set as Completed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'Cancelled')}>Set as Cancelled</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function OrderManagement() {
  const { orders, updateOrderStatus } = useOrders();
  const { reviews } = useReviews();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const activeOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const historicalOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Cancelled').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
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
    </>
  );
}

type MenuItemFormData = Omit<MenuItem, 'id' | 'aiHint'> & { id?: string };

function MenuManagement() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  }

  const handleAddNew = () => {
    setSelectedItem(null);
    setDialogOpen(true);
  }

  const handleDelete = (id: string) => {
    deleteMenuItem(id);
  }
  
  const handleSave = (itemData: MenuItemFormData) => {
    const finalImageUrl = itemData.imageUrl || 'https://placehold.co/600x400.png';
    const finalAiHint = itemData.name.toLowerCase();

    if (itemData.id) {
       updateMenuItem({
         ...itemData,
         id: itemData.id,
         imageUrl: finalImageUrl,
         aiHint: finalAiHint,
       });
     } else {
       const { id, ...newItemData } = itemData;
       addMenuItem({
         ...newItemData,
         imageUrl: finalImageUrl,
         // aiHint is added in the store
       });
     }
     setDialogOpen(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>Add, edit, or remove menu items.</CardDescription>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>Rs.{item.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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

function ReviewManagement() {
  const { reviews, addAdminReply } = useReviews();
  const [isReplyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReviewForReply, setSelectedReviewForReply] = useState<Review | null>(null);

  const handleReplyClick = (review: Review) => {
    setSelectedReviewForReply(review);
    setReplyDialogOpen(true);
  };

  const handleSaveReply = (reviewId: string, reply: string) => {
    addAdminReply(reviewId, reply);
    setReplyDialogOpen(false);
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>View and manage all customer feedback.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.orderId}</TableCell>
                  <TableCell>{review.customerName}</TableCell>
                  <TableCell>
                    <StarDisplay rating={review.rating} />
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">{review.comment}</TableCell>
                  <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleReplyClick(review)}>
                          <MessageSquare className={cn("h-4 w-4", review.adminReply ? "text-primary fill-primary/20" : "")} />
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
    </>
  );
}

function BrandManagement() {
  const { brandInfo, updateBrandInfo } = useBrand();
  const [name, setName] = useState(brandInfo.name);
  const [logoUrl, setLogoUrl] = useState(brandInfo.logoUrl);
  const [phone, setPhone] = useState(brandInfo.phone);
  const [address, setAddress] = useState(brandInfo.address);
  const [about, setAbout] = useState(brandInfo.about || '');
  const [youtubeUrl, setYoutubeUrl] = useState(brandInfo.youtubeUrl || '');
  const [instagramUrl, setInstagramUrl] = useState(brandInfo.instagramUrl || '');
  const [businessStatus, setBusinessStatus] = useState(brandInfo.businessHours.status);
  const [closureMessage, setClosureMessage] = useState(brandInfo.businessHours.message);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoUrl(reader.result as string);
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
      }
    });
    setIsSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Management</CardTitle>
        <CardDescription>Update your restaurant's branding and contact information.</CardDescription>
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
        <div className="space-y-2">
            <Label htmlFor="brand-address">Address</Label>
            <Textarea id="brand-address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
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
                <Input id="logo" type="file" onChange={handleFileChange} accept="image/*" className="max-w-xs" />
            </div>
        </div>
        <Separator className="my-6" />
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Business Hours</h3>
          <div className="flex items-center space-x-2 rounded-lg border p-4">
            <Switch
              id="business-status"
              checked={businessStatus === 'open'}
              onCheckedChange={(checked) => setBusinessStatus(checked ? 'open' : 'closed')}
            />
            <Label htmlFor="business-status" className="text-base flex-grow">
              {businessStatus === 'open' ? 'Open for Pre-Orders' : 'Closed for Pre-Orders'}
            </Label>
          </div>
          {businessStatus === 'closed' && (
            <div className="space-y-2">
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
      </CardContent>
      <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
      </CardFooter>
    </Card>
  );
}


export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between">
          <h1 className="text-4xl font-headline font-bold">Admin Dashboard</h1>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Link>
          </Button>
      </div>
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 md:w-[800px]">
          <TabsTrigger value="orders">Manage Orders</TabsTrigger>
          <TabsTrigger value="menu">Manage Menu</TabsTrigger>
          <TabsTrigger value="reviews">Manage Reviews</TabsTrigger>
          <TabsTrigger value="brand">Manage Brand</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>
        <TabsContent value="menu">
          <MenuManagement />
        </TabsContent>
         <TabsContent value="reviews">
          <ReviewManagement />
        </TabsContent>
        <TabsContent value="brand">
          <BrandManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
