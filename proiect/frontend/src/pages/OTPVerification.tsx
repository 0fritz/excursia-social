import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OTPVerificationForm } from '../components/auth/OTPVerificationForm';
import { useVerifyOtp, useRequestOtp } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const OTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const email = location.state?.email || '';
  const verifyOtpMutation = useVerifyOtp();
  const requestOtpMutation = useRequestOtp();

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleVerify = async (otp: string) => {
    try {
      const response = await verifyOtpMutation.mutateAsync({ 
        email, 
        code: otp 
      });
      
      if ('token' in response) {
        // Existing user
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('profilePicture', response.user.profile_picture || "");
        
        toast({
          title: "Welcome back!",
          description: `You have successfully logged in as ${response.user.name || email}.`,
        });
        
        navigate('/');
      } else if (response.newUser) {
        // New user
        localStorage.setItem('tempToken', response.tempToken);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        
        toast({
          title: "Welcome to Excursia!",
          description: "Your account has been created successfully.",
        });
        
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      toast({
        title: "Invalid code",
        description: "Please check your code and try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    navigate('/login');
  };

  const handleResend = async () => {
    try {
      await requestOtpMutation.mutateAsync({ email });
      toast({
        title: "Code resent",
        description: `We've sent a new verification code to ${email}`,
      });
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      toast({
        title: "Failed to send code",
        description: "There was an error sending the verification code. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            Enter the verification code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OTPVerificationForm
            email={email}
            onVerify={handleVerify}
            onBack={handleBack}
            isLoading={verifyOtpMutation.isPending}
            onResend={handleResend}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification;
