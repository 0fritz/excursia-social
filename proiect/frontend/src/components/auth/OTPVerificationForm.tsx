import React from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft } from 'lucide-react';

interface OTPVerificationFormProps {
  email: string;
  onVerify: (otp: string) => void;
  onBack: () => void;
  isLoading?: boolean;
  onResend?: () => void;
}

export function OTPVerificationForm({ 
  email, 
  onVerify, 
  onBack, 
  isLoading = false,
  onResend 
}: OTPVerificationFormProps) {
  const [otp, setOtp] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(otp);
  };

  return (
    <div className="space-y-6">
      <div className="text-center text-sm text-muted-foreground">
        We've sent a verification code to <span className="font-medium text-foreground">{email}</span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            disabled={isLoading}
            render={({ slots }) => (
              <InputOTPGroup>
                {slots.map((slot, index) => (
                  <InputOTPSlot key={index} {...slot} index={index} />
                ))}
              </InputOTPGroup>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
          {isLoading ? 'Verifying...' : 'Verify Account'}
        </Button>
        
        <div className="flex flex-col space-y-4">
          <Button 
            variant="ghost" 
            type="button" 
            onClick={onBack} 
            disabled={isLoading}
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Email</span>
          </Button>
          
          {onResend && (
            <Button 
              variant="link" 
              type="button" 
              onClick={onResend}
              disabled={isLoading}
              className="text-sm"
            >
              Didn't receive a code? Click to resend
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
