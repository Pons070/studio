
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Trash2, AlertTriangle } from 'lucide-react';

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
  const { currentUser, updateUser, isAuthenticated, deleteUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
    }
  }, [currentUser, isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    updateUser({ name, phone, address });
    setIsSubmitting(false);
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
                  address !== (currentUser.address || '');


  return (
    <>
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-lg mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">My Profile</CardTitle>
            <CardDescription>Update your personal information and contact details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={currentUser.email} disabled />
                <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="Enter your mobile number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Enter your full address" />
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
