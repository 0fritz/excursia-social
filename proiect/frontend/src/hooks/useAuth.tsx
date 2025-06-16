import { useMutation } from '@tanstack/react-query';
import { requestOtp, verifyOtp } from '../api/authApi';
import { RequestOtpPayload, VerifyOtpPayload } from '../api/types';

export const useRequestOtp = () =>
  useMutation({
    mutationFn: (payload: RequestOtpPayload) => requestOtp(payload),
    onError: (error) => {
      console.error('Error requesting OTP:', error);
    },
  });

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtp(payload),
    onError: (error) => {
      console.error('Error verifying OTP:', error);
    },
  });

export const useLogout = () => {
  return () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tempToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    
    // Force reload to update authentication state throughout the app
    window.location.href = '/login';
  };
};
