// Request
export interface RequestOtpPayload {
    email: string;
  }
  
  export interface VerifyOtpPayload {
    email: string;
    code: string;
  }
  
  // Response
  export interface RequestOtpResponse {
    message: string;
  }
  
  export interface VerifyOtpExistingUserResponse {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      profile_picture: string;
    };
    newUser: false;
  }
  
  export interface VerifyOtpNewUserResponse {
    tempToken: string;
    newUser: true;
    email: string;
  }
  
  export type VerifyOtpResponse = VerifyOtpExistingUserResponse | VerifyOtpNewUserResponse;
  