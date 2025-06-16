import {api} from './index';
import {
  RequestOtpPayload,
  RequestOtpResponse,
  VerifyOtpPayload,
  VerifyOtpResponse
} from './types';

export const requestOtp = async (
  payload: RequestOtpPayload
): Promise<RequestOtpResponse> => {
  const response = await api.post<RequestOtpResponse>('/auth/request-otp', payload);
  return response.data;
};

export const verifyOtp = async (
  payload: VerifyOtpPayload
): Promise<VerifyOtpResponse> => {
  const response = await api.post<VerifyOtpResponse>('/auth/verify-otp', payload);
  return response.data;
};
