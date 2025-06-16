import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EmailLoginForm } from '../components/auth/EmailLoginForm';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRequestOtp } from '../hooks/useAuth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const requestOtpMutation = useRequestOtp();

  const handleEmailSubmit = async (submittedEmail: string) => {
    try {
      await requestOtpMutation.mutateAsync({ email: submittedEmail });
      
      toast({
        title: "Verification code sent",
        description: `We've sent a verification code to ${submittedEmail}`,
      });
      
      // Navigate to OTP verification page and pass email as state
      navigate('/verify-otp', { state: { email: submittedEmail } });
    } catch (error) {
      console.error('Failed to request OTP:', error);
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
          <CardTitle className="text-2xl font-bold">Welcome to Excursia</CardTitle>
          <CardDescription>
            Enter your email to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailLoginForm onSubmit={handleEmailSubmit} isLoading={requestOtpMutation.isPending} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
