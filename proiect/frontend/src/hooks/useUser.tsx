import { useState, useEffect } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import axios from 'axios';
import { getFriends } from '@/api/friendsApi';

interface User {
  id: number;
  email: string;
  name: string;
}

export interface UserEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  image: string;
  maxAttendees?: number;
  interested: number;
  attendees: number;
  comments: number;
  organizerId: number;
  organizerName: string;
  organizerAvatar: string;
}


export const useUser = (): User | null => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Retrieve the user from localStorage and parse it
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return user;interface User {
    id: number;
    email: string;
    name: string;
  }
};


export const useToken = (): string | null => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve the token from localStorage
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  return token;
};

export const useUserEvents = (userId: number | undefined, options = {}) =>
  useQuery<UserEvent[]>({
    queryKey: ['userEvents', userId],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:3000/users/${userId}/events`);
      console.log("response:", res);
      
      return res.data;
    },
    enabled: !!userId,
    ...options,
  });


interface UseFriendsResult {
  friends: User[];
  loading: boolean;
  error: string | null;
}

export const useFriends = (token: string | null, userId: number | null): UseFriendsResult => {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!token || userId === null) return;

      try {
        const data = await getFriends(token, userId);
        setFriends(data);
      } catch (err) {
        setError('Failed to load friends.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [token, userId]);

  return { friends, loading, error };
};




