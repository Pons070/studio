
"use client";

import { useState } from "react";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Step = 'phone' | 'reset' | 'success';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { users, resetPassword } = useAuth();

    const handlePhoneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const userExists = users.some(user => user.phone === phone);
        if (userExists) {
            setStep('reset');
        } else {
            setError("No account found with that phone number.");
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        
        setIsSubmitting(true);
        const success = resetPassword(phone, password);
        if (success) {
            setStep('success');
        } else {
            setError("An unexpected error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <Card className="w-full max-w-md mx-auto shadow-lg">
                {step === 'phone' && (
                    <>
                        <CardHeader className="text-center">
                            <div className="flex justify-center items-center mb-4">
                                <KeyRound className="h-10 w-10 text-primary" />
                            </div>
                            <CardTitle className="font-headline text-3xl">Forgot Password?</CardTitle>
                            <CardDescription>Enter your phone number and we'll help you reset your password.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePhoneSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" type="tel" placeholder="Your phone number" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </div>
                                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                                <Button type="submit" className="w-full text-lg">
                                    Find Account
                                </Button>
                                <Button variant="link" asChild className="w-full">
                                    <Link href="/login">
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                                    </Link>
                                </Button>
                            </form>
                        </CardContent>
                    </>
                )}
                {step === 'reset' && (
                     <>
                        <CardHeader className="text-center">
                            <div className="flex justify-center items-center mb-4">
                                <KeyRound className="h-10 w-10 text-primary" />
                            </div>
                            <CardTitle className="font-headline text-3xl">Create a New Password</CardTitle>
                            <CardDescription>Enter a new password for {phone}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                </div>
                                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                                <Button type="submit" className="w-full text-lg" disabled={isSubmitting}>
                                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                                </Button>
                            </form>
                        </CardContent>
                    </>
                )}
                {step === 'success' && (
                    <>
                        <CardHeader className="text-center">
                            <div className="flex justify-center items-center mb-4">
                                <CheckCircle className="h-12 w-12 text-success" />
                            </div>
                            <CardTitle className="font-headline text-3xl">Password Reset!</CardTitle>
                            <CardDescription>Your password has been successfully updated.</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                           <Button asChild className="w-full text-lg">
                               <Link href="/login">Proceed to Login</Link>
                           </Button>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
