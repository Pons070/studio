
"use client";

import { useEffect } from 'react';
import type { Address } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddressSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';

export function AddressDialog({
    isOpen,
    onOpenChange,
    onSave,
    address
}: {
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
    onSave: (data: Address) => Promise<void>,
    address: Address | null
}) {
    const { toast } = useToast();
    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<Address>({
        resolver: zodResolver(AddressSchema),
        defaultValues: address || { label: 'Home', doorNumber: '', apartmentName: '', area: '', city: '', state: '', pincode: '' },
    });

    useEffect(() => {
        if(isOpen) {
            reset(address || { label: 'Home', doorNumber: '', apartmentName: '', area: '', city: '', state: '', pincode: '' });
        }
    }, [isOpen, address, reset]);
    
    const handleCaptureLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            setValue('latitude', position.coords.latitude, { shouldValidate: true, shouldDirty: true });
            setValue('longitude', position.coords.longitude, { shouldValidate: true, shouldDirty: true });
            toast({ title: "Location Captured!", description: "Your precise location has been saved." });
          }, (error) => {
            toast({ title: "Location Error", description: "Could not retrieve your location.", variant: "destructive" });
          });
        } else {
          toast({ title: "Geolocation Not Supported", description: "Your browser does not support this.", variant: "destructive" });
        }
    }

    const processSubmit = async (data: Address) => {
        await onSave(data);
        onOpenChange(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{address ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1 pr-4">
                     <div className="space-y-2">
                        <Label htmlFor="label">Label</Label>
                        <Input id="label" {...register('label')} placeholder="e.g., Home, Work" />
                        {errors.label && <p className="text-sm text-destructive">{errors.label.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="doorNumber">Door Number</Label>
                            <Input id="doorNumber" {...register('doorNumber')} />
                            {errors.doorNumber && <p className="text-sm text-destructive">{errors.doorNumber.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apartmentName">Apartment/Building Name</Label>
                            <Input id="apartmentName" {...register('apartmentName')} />
                            {errors.apartmentName && <p className="text-sm text-destructive">{errors.apartmentName.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="floorNumber">Floor Number (Optional)</Label>
                            <Input id="floorNumber" {...register('floorNumber')} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="area">Area Name</Label>
                            <Input id="area" {...register('area')} />
                            {errors.area && <p className="text-sm text-destructive">{errors.area.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" {...register('city')} />
                            {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" {...register('state')} />
                             {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input id="pincode" {...register('pincode')} />
                            {errors.pincode && <p className="text-sm text-destructive">{errors.pincode.message}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Button type="button" variant="outline" className="w-full" onClick={handleCaptureLocation}>
                                <MapPin className="mr-2 h-4 w-4" />
                                Capture My Location
                            </Button>
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="button" onClick={handleSubmit(processSubmit)} disabled={isSubmitting}>Save Address</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
