import { setAuthToken, api } from ".";

export interface User {
    id: number;
    name: string;
    email: string;
    profile_picture: string | null;
    cover_image: string | null;
    location: string | null;
    joinedDate: string | null;
    website: string | null;
    bio: string | null;
    tags?: string[];
  }
  

export const sendFriendRequest = async (token: string, userId2: number): Promise<{ message: string }> => {
    setAuthToken(token);
    const response = await api.post<{ message: string }>('/friendships/request', {
      user_id2: userId2
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  
    return response.data;
  };

  export const respondToFriendRequest = async (
    token: string,
    fromUserId: number,
    decision: 'accepted' | 'rejected'
  ): Promise<{ message: string }> => {
    setAuthToken(token);
    const response = await api.post<{ message: string }>('/friendships/respond', {
      fromUserId,
      decision
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  
    return response.data;
  };

  export const getPendingFriendRequests = async (token: string): Promise<{ requests: { fromUserId: number }[] }> => {
    setAuthToken(token);
    const response = await api.get<{ requests: { fromUserId: number }[] }>('/friendships/pending', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
  
    return response.data;
  };

export const getUserProfiles = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

export const getFriends = async (token: string, userId: number): Promise<User[]> => {
  const response = await api.get<User[]>(`/friendships/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  return response.data;
};

  