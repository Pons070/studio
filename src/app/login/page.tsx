
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils, MessageCircle, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from "@/store/auth";
import { useRouter } from 'next/navigation';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { requestOtp, verifyOtpAndLogin } = useAuth();
  const router = useRouter();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setIsSubmitting(true);

    const result = await requestOtp(phone);
    if (result.success) {
      setIsNewUser(result.isNewUser);
      setStep('otp');
    }
    setIsSubmitting(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setIsSubmitting(true);

    const success = await verifyOtpAndLogin(phone, otp, isNewUser ? name : undefined);
    
    if (success) {
      router.push('/');
    }
    
    setIsSubmitting(false);
    setOtp('');
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Utensils className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">
            {step === 'phone' ? 'Login or Sign Up' : 'Enter Verification Code'}
          </CardTitle>
          <CardDescription>
             {step === 'phone' 
                ? 'Enter your mobile number to continue.'
                : `We've sent a code to +91 ${phone}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                    <div className="h-10 px-3 py-2 border rounded-md bg-muted text-muted-foreground text-sm flex items-center">
                        +91
                    </div>
                    <Input id="phone" type="tel" placeholder="Your 10-digit number" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                </div>
              </div>
              <Button type="submit" className="w-full text-lg" disabled={isSubmitting || phone.length !== 10}>
                {isSubmitting ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              {isNewUser && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" placeholder="Enter your full name" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
              )}
              <div className="space-y-2 flex flex-col items-center">
                 <Label htmlFor="otp">One-Time Password (OTP)</Label>
                 <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                 </InputOTP>
              </div>

              <div className="flex flex-col gap-4">
                <Button type="submit" className="w-full text-lg" disabled={isSubmitting || otp.length !== 6 || (isNewUser && !name)}>
                  {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
                </Button>
                <Button variant="link" onClick={() => { setStep('phone'); setOtp(''); }} className="text-sm">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
