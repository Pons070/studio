
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { Trash2, AlertTriangle, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/lib/types';


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

const initialAddressState: Address = {
    doorNumber: '',
    apartmentName: '',
    floorNumber: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    latitude: undefined,
    longitude: undefined,
};

export default function ProfilePage() {
  const { currentUser, updateUser, isAuthenticated, deleteUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState<Address>(initialAddressState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || initialAddressState);
    }
  }, [currentUser, isAuthenticated, router]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setAddress(prev => ({ ...prev, [id]: value }));
  }

  const handleCaptureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setAddress(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        toast({
          title: "Location Captured!",
          description: "Your precise location has been saved.",
        });
      }, (error) => {
        console.error("Error getting location", error);
        toast({
          title: "Location Error",
          description: "Could not retrieve your location. Please check your browser permissions.",
          variant: "destructive"
        });
      });
    } else {
      toast({
          title: "Geolocation Not Supported",
          description: "Your browser does not support geolocation.",
          variant: "destructive"
        });
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    updateUser({ name, phone, address });
    // A little delay to simulate saving and show the disabled state
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
                  phone !== (currentUser.phone || '') ||
                  JSON.stringify(address) !== JSON.stringify(currentUser.address || initialAddressState);


  return (
    <>
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">My Profile</CardTitle>
            <CardDescription>Update your personal information and contact details.</CardDescription>
          </CardHeader>
          <CardContent>
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

              <Separator />

              <div className="space-y-4">
                  <Label className="text-base font-medium">Address</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="doorNumber">Door Number</Label>
                        <Input id="doorNumber" value={address.doorNumber} onChange={handleAddressChange} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="apartmentName">Apartment/Building Name</Label>
                        <Input id="apartmentName" value={address.apartmentName} onChange={handleAddressChange} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="floorNumber">Floor Number (Optional)</Label>
                        <Input id="floorNumber" value={address.floorNumber || ''} onChange={handleAddressChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="area">Area Name</Label>
                        <Input id="area" value={address.area} onChange={handleAddressChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={address.city} onChange={handleAddressChange} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" value={address.state} onChange={handleAddressChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input id="pincode" value={address.pincode} onChange={handleAddressChange} required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Button type="button" variant="outline" className="w-full" onClick={handleCaptureLocation}>
                            <MapPin className="mr-2 h-4 w-4" />
                            Capture My Location
                        </Button>
                    </div>
                    {address.latitude && address.longitude && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input id="latitude" type="text" value={address.latitude} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input id="longitude" type="text" value={address.longitude} disabled />
                            </div>
                        </>
                    )}
                  </div>
              </div>

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
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
    </>
  );
}
