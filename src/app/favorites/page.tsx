
"use client";

import { useFavorites } from "@/store/favorites";
import { useMenu } from "@/store/menu";
import { useOrders } from "@/store/orders";
import { useAuth } from "@/store/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, PlusCircle, ShoppingBag, Utensils, History } from "lucide-react";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

export default function FavoritesPage() {
    const router = useRouter();
    const { isAuthenticated, currentUser } = useAuth();
    const { menuItems } = useMenu();
    const { orders } = useOrders();
    const { favoriteItemIds, isItemFavorite, toggleFavoriteItem, favoriteOrderIds, isOrderFavorite, toggleFavoriteOrder } = useFavorites();
    const { addItem, addMultipleItems, reorder } = useCart();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !currentUser) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <p>Loading favorites...</p>
            </div>
        );
    }
    
    const favoriteMenuItems = menuItems.filter(item => isItemFavorite(item.id));
    const favoriteOrders = orders.filter(order => isOrderFavorite(order.id) && order.customerId === currentUser.id);

    return (
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-headline font-bold">My Favorites</h1>
                <p className="text-lg text-white font-bold mt-2">Your favorite dishes and past orders, all in one place.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Utensils className="h-7 w-7 text-primary" />
                            <CardTitle className="text-2xl font-headline">Favorite Dishes</CardTitle>
                        </div>
                        {favoriteMenuItems.length > 0 && (
                            <Button onClick={() => addMultipleItems(favoriteMenuItems)}>
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                Add All to Cart
                            </Button>
                        )}
                    </div>
                    <CardDescription>Quickly add your most-loved dishes to your cart.</CardDescription>
                </CardHeader>
                <CardContent>
                    {favoriteMenuItems.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favoriteMenuItems.map(item => (
                                <Card key={item.id} className="group relative flex flex-col">
                                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <CardContent className="pt-4 flex-grow">
                                        <CardTitle className="text-lg">{item.name}</CardTitle>
                                        <CardDescription className="text-sm mt-1">{item.description}</CardDescription>
                                    </CardContent>
                                    <CardFooter className="flex justify-between items-center mt-auto">
                                        <span className="font-bold text-lg text-primary">Rs.{item.price.toFixed(2)}</span>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => toggleFavoriteItem(item.id)}>
                                                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                            </Button>
                                            <Button onClick={() => addItem(item)} disabled={!item.isAvailable}>
                                                <PlusCircle className="mr-2 h-4 w-4" /> Add
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>You haven't favorited any dishes yet.</p>
                            <Button asChild variant="link" className="mt-2 text-primary">
                                <Link href="/menu">Browse the menu to find your favorites!</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                     <div className="flex items-center gap-3">
                        <History className="h-7 w-7 text-primary" />
                        <CardTitle className="text-2xl font-headline">Favorite Orders</CardTitle>
                    </div>
                    <CardDescription>Reorder your favorite past orders with a single click.</CardDescription>
                </CardHeader>
                <CardContent>
                    {favoriteOrders.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="hidden sm:table-cell">Order ID</TableHead>
                                    <TableHead>Pickup Date</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {favoriteOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium hidden sm:table-cell">{order.id}</TableCell>
                                        <TableCell>{new Date(order.pickupDate).toLocaleDateString()}</TableCell>
                                        <TableCell>Rs.{order.total.toFixed(2)}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="secondary" onClick={() => reorder(order.items)}>Reorder</Button>
                                            <Button variant="ghost" size="icon" onClick={() => toggleFavoriteOrder(order.id)}>
                                                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>You haven't favorited any orders yet.</p>
                            <Button asChild variant="link" className="mt-2 text-primary">
                                <Link href="/orders">View your order history to add favorites.</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
