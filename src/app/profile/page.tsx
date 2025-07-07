

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Trash2, AlertTriangle, Home, Building, Edit, PlusCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AddressDialog } from '@/components/address-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

function DeleteProfileDialog({ isOpen, onOpenChange, onConfirm }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onConfirm: () => void }) {
    const [confirmationInput, setConfirmationInput] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setConfirmationInput('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        if (confirmationInput === 'DELETE') {
            onConfirm();
            onOpenChange(false);
        }
    }

    const isConfirmationMatch = confirmationInput === 'DELETE';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                       <AlertTriangle className="h-6 w-6 text-destructive" /> Are you absolutely sure?
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <p className="text-sm">
                        To confirm, please type <strong>DELETE</strong> in the box below.
                    </p>
                    <Input
                        id="delete-confirmation"
                        value={confirmationInput}
                        onChange={(e) => setConfirmationInput(e.target.value)}
                        placeholder="Type DELETE here"
                        className="font-mono"
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="button" variant="destructive" onClick={handleConfirm} disabled={!isConfirmationMatch}>
                        I understand, delete my account
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function ProfilePage() {
  const { currentUser, updateUser, isAuthenticated, deleteUser, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isAddressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser, isAuthenticated, router]);
  
  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressDialogOpen(true);
  }

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setAddressDialogOpen(true);
  }

  const handleSaveAddress = (data: Address) => {
    if(data.id) { // Editing existing address
        updateAddress(data);
    } else { // Adding new address
        const { id, isDefault, ...newAddressData } = data;
        addAddress(newAddressData);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    updateUser({ name, phone });
    setTimeout(() => setIsSubmitting(false), 500);
  };
  
  if (!currentUser) {
      return (
          <div className="flex items-center justify-center min-h-[70vh]">
             <p>Loading profile...</p>
          </div>
      )
  }
  
  const isDirty = name !== (currentUser.name || '') ||
                  phone !== (currentUser.phone || '');

  const userAddresses = currentUser.addresses || [];

  return (
    <>
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">My Profile</CardTitle>
            <CardDescription>Update your personal information and manage your addresses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Enter your mobile number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={currentUser.email} disabled />
                <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
              </div>

              <Button type="submit" className="w-full text-lg" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>

            <Separator />
            
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">My Addresses</h3>
                    <Button onClick={handleAddNewAddress} disabled={userAddresses.length >= 6}>
                        <PlusCircle /> Add New Address
                    </Button>
                </div>
                <div className="space-y-4">
                    {userAddresses.length > 0 ? (
                        userAddresses.map(address => (
                            <Card key={address.id} className={cn("p-4", address.isDefault && "border-primary")}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        {address.label === 'Home' ? <Home className="h-5 w-5 text-muted-foreground" /> : <Building className="h-5 w-5 text-muted-foreground" />}
                                        <div>
                                            <p className="font-bold">{address.label}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {address.doorNumber}, {address.apartmentName}, {address.area}, {address.city} - {address.pincode}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditAddress(address)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteAddress(address.id!)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    {address.isDefault ? (
                                        <span className="text-sm font-medium text-primary flex items-center gap-2"><Star className="h-4 w-4" /> Default Address</span>
                                    ) : (
                                        <Button variant="link" className="p-0 h-auto" onClick={() => setDefaultAddress(address.id!)}>Set as Default</Button>
                                    )}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-4">You have no saved addresses.</p>
                    )}
                </div>
            </div>

          </CardContent>
          <CardFooter className="flex-col gap-4 items-start pt-6">
              <Separator />
              <div className="w-full">
                  <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                  <div className="flex justify-between items-center mt-2 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                      <div>
                          <p className="font-medium">Delete your account</p>
                          <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back.</p>
                      </div>
                      <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                         <Trash2 className="mr-2 h-4 w-4" />
                         Delete Account
                      </Button>
                  </div>
              </div>
          </CardFooter>
        </Card>
      </div>
       <DeleteProfileDialog
            isOpen={isDeleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={deleteUser}
        />
       <AddressDialog 
            isOpen={isAddressDialogOpen}
            onOpenChange={setAddressDialogOpen}
            onSave={handleSaveAddress}
            address={editingAddress}
       />
    </>
  );
}
